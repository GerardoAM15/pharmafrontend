import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { mensajeError } from '../../../../core/utils/http-error';
import { VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-categoria',
  imports: [CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css',
})
export class VentasCategoria implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly ventas = signal<VentaPorCategoria[] | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros = this.fb.group({
    desde: '',
    hasta: '',
  });

  protected readonly totalUnidades = computed(() =>
    (this.ventas() ?? []).reduce((total, venta) => total + venta.cantidadVendida, 0),
  );
  protected readonly montoGeneral = computed(() =>
    (this.ventas() ?? []).reduce((total, venta) => total + venta.montoTotal, 0),
  );
  protected readonly montoMayor = computed(() =>
    Math.max(0, ...(this.ventas() ?? []).map(venta => venta.montoTotal)),
  );

  ngOnInit(): void {
    this.generar();
  }

  generar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.reporteService.ventasPorCategoria(desde || null, hasta || null).subscribe({
      next: resultado => {
        this.ventas.set(resultado);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.generar();
  }

  anchoBarra(monto: number): number {
    const mayor = this.montoMayor();
    return mayor > 0 ? (monto / mayor) * 100 : 0;
  }
}
