# language: es
@ui @sin-sesion
Característica: Inicio de sesión
  Como cliente de la tienda
  Quiero iniciar sesión con mi usuario
  Para acceder al listado de productos

  Antecedentes:
    Dado que el usuario está en la página de inicio de sesión

  @UI-01 @smoke
  Escenario: UI-01 Inicio de sesión exitoso con standard_user
    Cuando inicia sesión como usuario "standard"
    Entonces accede al listado de productos

  @UI-02
  Escenario: UI-02 Usuario bloqueado no puede iniciar sesión
    Cuando inicia sesión como usuario "bloqueado"
    Entonces ve el mensaje de error "Epic sadface: Sorry, this user has been locked out."
    Y permanece en la página de inicio de sesión sin ver productos
    Cuando intenta abrir el listado de productos directamente
    Entonces ve el mensaje de error "Epic sadface: You can only access '/inventory.html' when you are logged in."
    Y permanece en la página de inicio de sesión sin ver productos
