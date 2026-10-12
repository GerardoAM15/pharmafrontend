import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categoriaPorEliminar = signal<Categoria | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly filtro = signal('');
  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return this.categorias().filter(categoria => categoria.nombre.toLowerCase().includes(texto));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.categoriaService.listar().subscribe({
      next: datos => {
        this.categorias.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  eliminar(categoria: Categoria): void {
    this.error.set(null);
    this.categoriaPorEliminar.set(categoria);
  }

  cancelarEliminacion(): void {
    if (!this.eliminando()) {
      this.categoriaPorEliminar.set(null);
    }
  }

  confirmarEliminacion(): void {
    const categoria = this.categoriaPorEliminar();
    if (!categoria || this.eliminando()) return;

    this.eliminando.set(true);
    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.categorias.update(lista => lista.filter(item => item.id !== categoria.id));
        this.categoriaPorEliminar.set(null);
        this.eliminando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.eliminando.set(false);
        this.categoriaPorEliminar.set(null);
      },
    });
  }
}
