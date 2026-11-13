# language: es
@ui
Característica: Compra de productos
  Como cliente autenticado
  Quiero comprar varios productos en una sola orden
  Para pagar el total correcto y recibir la confirmación

  @UI-03 @smoke
  Escenario: UI-03 Compra completa de dos productos
    Dado que el usuario autenticado está en el listado de productos
    Cuando agrega al carrito los productos:
      | producto              |
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    Entonces el contador del carrito muestra 2
    Cuando abre el carrito
    Entonces el carrito contiene exactamente los productos elegidos
    Cuando continúa al checkout con los datos del comprador:
      | nombre | apellido | codigoPostal |
      | Ana    | Quispe   | 15001        |
    Entonces el resumen contiene exactamente los productos elegidos
    Y el Item total es la suma de los precios de los productos elegidos
    Y el Total es el Item total más el impuesto
    Cuando finaliza la compra
    Entonces ve la confirmación "Thank you for your order!"
    Y ve el detalle "Your order has been dispatched, and will arrive just as fast as the pony can get there!"
    Y el carrito queda vacío
