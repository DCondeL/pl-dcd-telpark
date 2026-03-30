# Test Cases – Empark Abonos

## Información general

**Aplicación analizada:** `https://test.abonos.empark.com/home/es/es`  
**Objetivo del análisis:** Validar los flujos públicos críticos orientados a la venta de abonos.  

---

# TC-001 – Navegación a Home Page
**Objetivo:** Navegación y visualización correcta de la Home Page, así como de las intrucciones de uso

## Precondiciones
- El usuario accede a la web pública sin autenticarse

## Datos de prueba
| Campo | Valor |
|---|---|
| URL | `https://test.abonos.empark.com/home/es/es` |

## Pasos
1. Navegar a la url de la Home Page

## Resultado esperado
- Se muestra la Home Page de abonos, con un input con placeholder "Introduce una ubicación", y un botón con texto "Buscar"
- Haciendo scroll, se encuentran las 4 pasos para el correcto uso de la herramienta 

---

# TC-002 – Búsqueda de ubicación
**Objetivo:** El usuario puede buscar correctamente una ubicación existente, introduciendo una ubicación en el input correspondiente y utilizando el botón de "Buscar". El mapa se carga en la ubicación correspondiente.

## Precondiciones
- El usuario accede a la web pública sin autenticarse
- Al menos una ubicación dispone de un aparcamiento disponible

## Datos de prueba
| Campo | Valor |
|---|---|
| URL | `https://test.abonos.empark.com/home/es/es` |
| Ubicación | A Coruña, La Coruña, España |

## Pasos
1. Navegar a Home Page de abonos empark
2. Click en el input de búsqueda
3. Introducir ubicación de las precondiciones
4. Click en el botón "Buscar"

## Resultado esperado
- Se muestra la pantalla de mapa
- El input muestra la ubicación introducida
- La ubicación correspondiente se muestra centrada en el mapa
- El contador muestra el número de aparcamientos disponibles en la ubicación
- Los aparcamientos disponibles se muestran en el listado, con el nombre identificador del mismo, su dirección, y el precio correspondiente.
- Se muestra el botón de selección en cada elemento de la lista.

---

# TC-003 – Selección de aparcamiento y abono mensual

**ID:** TC-003 
**Objetivo:** El usuario puede seleccionar un aparcamiento existente y seleccionarlo, así como elegir los abonos disponibles, y es redirigido a la pantalla de datos personales, donde se muestran los campos necesarios y un resumen del costo de la operación.

## Precondiciones
- El usuario accede a la web pública sin autenticarse

## Datos de prueba
| Campo | Valor |
|---|---|
| URL | `https://test.abonos.empark.com/home/es/es` |
| Ubicación | Santiago de Compostela, La Coruña, España |
| Parking| Praza de Galicia
| Abonos | Abono mensual, 95€/mes
| Inicio Parking | 2099-12-20

## Pasos
1. Navegar hasta Home Page
2. Click en el input de búsqueda
3. Introducir ubicación de las precondiciones
4. Click en el botón "Buscar"
5. Click en el botón "Seleccionar"
6. Seleccionar el checkbox "Abono mensual 24H"
7. Click en fecha de inicio
8. Introducir fecha de inicio correspondiente
9. Click en botón "Comprar abono"

## Resultado esperado
- El usuario es redirigido a la pantalla de datos personales
- Se muestra el formulario con las secciones de "Datos Personales" y "¿Dónde deseas recibir tu tarjeta?"
- Los campos mostrados en el formulario son: Nombre, Apellidos, DNI, Teléfono; Dirección, Código Postal, Ciudad, País, Matricula asociada a tu abono, email, confirmación de email, comentarios, tus datos de facturación no son los mismos que tus datos personales.
- Se muestra un resumen con el tipo de abono, la ubicación y la fecha de inicio del mismo
- Se muestra el botón de continuar, bloqueado hasta que los campos se completen.

---

# TC-004 – Rellenar datos personales
**Objetivo:** El usuario puede rellenar los datos personales y avanzar a pasarela de pago.

## Precondiciones
- El usuario accede a la web pública sin autenticarse
- El usuario ha seleccionado un parking y un abono válidos
- El usuario se encuentra en el paso 1 de la pasarela de pago.

## Datos de prueba
| Campo | Valor |
|---|---|
| URL | `https://test.abonos.empark.com/home/es/es` |
| personalData | {
          nombreCliente: 'Juan',
          apellidos: 'Pérez',
          dni: '12345678Z',
          telefono: '612345678',
          direccion: 'Calle Mayor 1',
          codigoPostal: '15001',
          ciudad: 'A Coruña',
          codigoPais: 'ES',
          matricula: '1234ABC',
          email: 'qa.empark@example.com',
          emailConfirm: 'qa.empark@example.com',
          comentarios: '',
          termsAccepted: true,
          wantsBill: false,
          sendNotifications: false,
        }
| Precio | 95€/mes

## Pasos
1. Navegar a la home page de Abonos y completar los pasos hasta llegar a la pantalla de datos personales
2. Completar el formulario con los datos personales
3. Aceptar los términos y condiciones
4. Click en el botón "Continuar"

## Resultado esperado
- Se muestra correctamente la pantalla de Pago, indicando que es preciso añadir una tarjeta de crédito para realizar el pago
- Se muestra correctamente el botón de "Pagar con tarjeta de crédito"
- Se muestra el resumen de la operación, incluído el costo de la misma

---

# TC-005 – Completar datos de pago y confirmar compra del abono
**Objetivo:** El usuario puede completar correctamente los datos de pago, se muestra la pantalla de confirmación con el resumen y los datos correctos (precio, datos de facturación), y puede confirmar el pago.

## Precondiciones
- El usuario accede a la web pública sin autenticarse
- El usuario ha seleccionado un parking válido, un abono mensual y ha rellenado los datos personales obligatorios con valores válidos.
- El usuario se encuentra en el paso 2 de la pasarela de pago.

## Datos de prueba
| Campo | Valor |
|---|---|
| URL | `https://test.abonos.empark.com/home/es/es` |
| Datos bancarios | 2222 4000 7000 0005 CA 03/30 737
| Resumen de operación esperado | parking: {
          name: 'Parking Plaza Galicia',
          address: 'Praza de Galicia, 15004 A Coruña',
        },
        tarifa: {
          descripcion: 'Abono Mensual 24H',
          fechaInicio: '2099-12-20',
        },
        personalData: {
          nombreCliente: 'Juan',
          apellidos: 'Pérez',
          email: 'qa.empark@example.com',
          matricula: '1234ABC',
        },
        amount: {
          primerPago: 20,
          precioDescuento: 95,
          precioNormal: 120,
          fechaMax: '2099-12-31',
          fechaMaxPrecioDecuento: '2099-12-31',
        }

## Pasos
1. Completar los pasos necesarios hasta el paso 2 de la pasarela de pago
2. Click en botón "Pagar con tarjeta de crédito"
3. Rellenar el formulario con valores válidos
4. Click en botón "Continuar"
5. Click en botón "Confirmar compra"

## Resultado esperado
- El usuario avanza con éxito y confirma la compra del abono, siendo informado de su coste y abonando dicha cantidad con el medio de pago seleccionado.
- Se muestra la pantalla de "Compra efectuada correctamente"
- Se muestra un resumen de la operación y un enlace para volver a la pantalla principal