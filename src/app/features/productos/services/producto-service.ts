import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizarPagina, PaginaResponse } from '../../../core/models/pagina-response';
import { Direccion, OrdenProducto, Producto, ProductoRequest } from '../models/producto.model';

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoria?: { id: number; nombre: string };
  categoriaId?: number;
  categoriaNombre?: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(
    pagina: number,
    tamanio: number,
    ordenarPor: OrdenProducto,
    direccion: Direccion,
  ): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    return this.http.get<PaginaResponse<ProductoApi> | ProductoApi[]>(this.url, { params }).pipe(
      map(respuesta => normalizarPagina(respuesta, pagina, tamanio)),
      map(resultado => ({
        ...resultado,
        contenido: resultado.contenido.map(producto => this.normalizarProducto(producto)),
      })),
    );
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<ProductoApi>(`${this.url}/${id}`).pipe(
      map(producto => this.normalizarProducto(producto)),
    );
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<ProductoApi>(this.url, dto).pipe(
      map(producto => this.normalizarProducto(producto)),
    );
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<ProductoApi>(`${this.url}/${id}`, dto).pipe(
      map(producto => this.normalizarProducto(producto)),
    );
  }

  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private normalizarProducto(producto: ProductoApi): Producto {
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      estado: producto.estado,
      categoriaId: producto.categoria?.id ?? producto.categoriaId ?? 0,
      categoriaNombre: producto.categoria?.nombre ?? producto.categoriaNombre ?? '',
      fechaCreacion: producto.fechaCreacion,
      fechaModificacion: producto.fechaModificacion,
    };
  }
}
