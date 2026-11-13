# language: es
@ui
Característica: Ordenamiento del listado de productos
  Como cliente autenticado
  Quiero ordenar los productos por precio
  Para encontrar rápido las opciones más económicas

  @UI-04
  Escenario: UI-04 Ordenar por precio de menor a mayor
    Dado que el usuario autenticado está en el listado de productos
    Y el listado inicial no está ordenado por precio
    Cuando ordena los productos por "Price (low to high)"
    Entonces el criterio de orden activo es "Price (low to high)"
    Y el listado completo queda ordenado por precio de menor a mayor
