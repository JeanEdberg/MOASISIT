/**
 * Tabla 30 de SUNAT — Ocupación del sector privado (4 642 códigos de 6 dígitos).
 *
 * Fuente: tablas del T-Registro / PDT PLAME (RM 250-2007-TR). Los códigos y
 * descripciones se verificaron contra dos fuentes independientes que coinciden.
 *
 * Módulo PURO. El formato compacto "codigo|descripcion" (una por línea) evita
 * inflar el bundle con 4 642 objetos. Al actualizar la tabla, reemplaza DATA y
 * ajusta los tests.
 */

const DATA = `114001|Dirigente, Partido Politico
114002|Secretario General, Partido Politico
114003|Secretario, Partido Politico
115001|Dirigente, Organizacion De Empleadores
115002|Dirigente, Sindicato De Trabajadores
115003|Secretario General, Organizacion De Empleadores
115004|Secretario General, Sindicato De Trabajadores
116001|Dirigente, Organizacion Especializada
116002|Secretario General, Organizacion De Proteccion De La Fauna
116003|Secretario General, Organizacion De Proteccion Del Medio Am
121001|Director De Empresas, De Agricultura, Caza, Silvicultura Y
121002|Director Ejecutivo, Empresa, Agricultura, Caza, Silvicultur
121003|Director General, Empresa/Agricultura
121004|Director General, Empresa/Caza
121005|Director General, Empresa/Explotacion: Agricola, Forestal Y
121006|Director General, Empresa/Pesca
121007|Director General, Empresa/Silvicultura
121008|Director General, Organizacion/ Caza
121009|Director General, Organizacion/Pesca
121010|Director General, Organizacion/Silvicultura
121011|Gerente General, Empresa/Agricultura
121012|Gerente General, Empresa/Caza
121013|Gerente General, Empresa/Pesca
121014|Gerente General, Empresa/Silvicultura
121015|Gerente General, Organizacion/Caza
121016|Gerente General, Organizacion/Pesca
121017|Gerente General, Organizacion/Silvicultura
121018|Miembro Del Directorio, Asesor Tecnico/Explotacion: Agricol
121019|Miembro Del Directorio, Consejo Administrativo/Coop. Agrari
121020|Presidente Del Directorio, Agricultura, Caza, Silvicultura
121021|Sub Director De Empresa, Agricultura, Caza, Silvicultura Y
122001|Director De Empresas, De Industrias Manufactureras, Minas Y
122002|Director Ejecutivo, Empresa, Industria Manufacturera, Minas
122003|Director General, Empresa/Industria Manufacturera
122004|Director General, Empresa/Suministro De Electricidad, Gas Y
122005|Gerente General, Empresa/Industria Manufacturera
122006|Gerente General, Empresa/Suministro De Electricidad, Gas Y
122007|Miembro Del Directorio, Industrias Manufactureras, Minas Y
122008|Presidente Del Directorio, Industrias Manufactureras, Minas
122009|Sub Director De Empresa, Industrias Manufactureras, Minas Y
123001|Director De Empresas, De Construccion Y Obras Publicas
123002|Director Ejecutivo, Empresa, De Construccion Y Obras Public
123003|Director General, Empresa/Construccion Y Obras Publicas
123004|Gerente General, Empresa/Construccion Y Obras Publicas
123005|Miembro Del Directorio, Construccion Y Obras Publicas
123006|Presidente Del Directorio, Contruccion Y Obras Publicas
123007|Sub Director De Empresa, Construccion Y Obras Publicas
124001|Director De Empresas, De Comercio Mayorista Y Minorista, Re
124002|Director Ejecutivo, Empresa, De Comercio Mayorista Y Minori
124003|Director General, Empresa/Comercio Mayorista
124004|Director General, Empresa/Comercio Minorista
124005|Director General, Organizacion/Comercio Mayorista
124006|Director General, Organizacion/Comercio Minorista
124007|Director General, Reparacion/Vehiculos, Automotores, Etc.
124008|Gerente General, Empresa/Comercio Mayorista
124009|Gerente General, Empresa/Comercio Minorista
124010|Gerente Organizacion, Empresa/Comercio Mayorista
124011|Gerente Organizacion, Empresa/Comercio Minorista
124012|Miembro Del Directorio, Comercio Mayorista Y Minorista, Rep
124013|Presidente Del Directorio, Comercio Mayorista Y Minorista,
124014|Sub Director De Empresa, Coimercio Mayorista Y Minorista, R
125001|Director De Empresas, De Restaurantes Y Hoteleria
125002|Director Ejecutivo, Empresa, De Restaurantes Y Hoteleria
125003|Director General, Empresa/Hoteleria
125004|Director General, Empresa/Restaurante
125005|Director General, Organizacion/Hoteleria
125006|Director General, Organizacion/Restaurante
125007|Gerente General, Empresa/Hoteleria
125008|Gerente General, Empresa/Restaurante
125009|Gerente General, Organizacion/Hoteleria
125010|Gerente General, Organizacion/Restaurantes
125011|Miembro Del Directorio, Restaurantes Y Hoteleria
125012|Presidente Del Directorio, Restaurantes Y Hoteleria
125013|Sub Director De Empresa, Restaurantes Y Hoteleria
126001|Director De Empresas, De Transporte, Almacenamiento Y Comun
126002|Director Ejecutivo, Empresa, De Transporte, Almacenamiento
126003|Director General, Empresa/Almacenamiento
126004|Director General, Empresa/Comunicaciones
126005|Director General, Empresa/Transporte
126006|Director General, Organizacion/Transporte
126007|Gerente General, Empresa/Almacenamiento
126008|Gerente General, Empresa/Comunicaciones
126009|Gerente General, Empresa/Transporte
126010|Gerente General, Organizacion/Transporte
126011|Miembro Del Directorio, Transporte, Almacenamiento Y Comuni
126012|Presidente Del Directorio, Transporte, Almacenamiento Y Com
126013|Sub Director De Empresa, Transporte, Almacenamiento Y Comun
127001|Director De Empresas, De Servicios Publicos Y Financieros
127002|Director Ejecutivo, Empresa, De Servicios Publicos Y Financ
127003|Director General, Empresa/Actividades Culturales
127004|Director General, Empresa/Actividades Deportivas
127005|Director General, Empresa/Actividades Recreativas
127006|Director General, Empresa/Agencia De Viajes
127007|Director General, Empresa/Intermediacion Financiera
127008|Director General, Empresa/Limpieza
127009|Director General, Empresa/Servicio De Empresa
127010|Director General, Empresa/Servicio De Sanidad
127011|Director General, Empresa/Trabajo Social
127012|Director General, Organizacion/Actividades Culturales
127013|Director General, Organizacion/Actividades Deportivas
127014|Director General, Organizacion/Actividades Recreativas
127015|Director General, Organizacion/Agencia De Viajes
127016|Director General, Organizacion/Intermediacion Financiera
127017|Director General, Organizacion/Limpieza
127018|Director General, Organizacion/Servicio De Empresa
127019|Director General, Organizacion/Servicio De Sanidad
127020|Director General, Organizacion/Trabajo Social
127021|Gerente General, Empresa/Actividades Culturales
127022|Gerente General, Empresa/Actividades Deportivas
127023|Gerente General, Empresa/Actividades Recreativas
127024|Gerente General, Empresa/Agencia De Viajes
127025|Gerente General, Empresa/Intermediacion Financiera
127026|Gerente General, Empresa/Limpieza
127027|Gerente General, Empresa/Servicio De Empresa
127028|Gerente General, Empresa/Servicio De Sanidad
127029|Gerente General, Empresa/Trabajo Social
127030|Gerente General, Organizacion/Actividades Culturales
127031|Gerente General, Organizacion/Actividades Deportivas
127032|Gerente General, Organizacion/Actividades Recreativas
127033|Gerente General, Organizacion/Agencia De Viajes
127034|Gerente General, Organizacion/Intermediacion Financiera
127035|Gerente General, Organizacion/Limpieza
127036|Gerente General, Organizacion/Servicio De Empresa
127037|Gerente General, Organizacion/Servicio De Sanidad
127038|Gerente General, Organizacion/Trabajo Social
127039|Miembro Del Directorio, Servicios Publicos Y Financieros
127040|Presidente Del Directorio, Servicios Publicos Y Financieros
127041|Sub Director De Empresa, Servicios Publicos Y Financieros
128001|Director De Departamento, Produccion Y Operaciones/Agricult
128002|Director De Departamento, Produccion Y Operaciones/Pesca
128003|Director De Departamento, Produccion Y Operaciones/Silvicul
129001|Director De Departamento, Produccion Y Operaciones/Industri
129003|Director De Explotacion De Minas Y Canteras
129004|Gerente De Planta
129005|Gerente De Produccion
129006|Gerente Industrial
129007|Super Intendente De Planta
129008|Super Intendente De Produccion
129009|Supervisor De Produccion
131001|Director De Departamento, Produccion Y Operaciones/Construc
132001|Director De Departamento, Produccion Y Operaciones/Comercio Mayorista
132002|Director De Departamento, Produccion Y Operaciones/Comercio Mayorista Exportación
132003|Director De Departamento, Produccion Y Operaciones/Comercio Mayorista Importación
132004|Director De Departamento, Produccion Y Operaciones/Comercio Minorista
132005|Director De Departamento, Produccion Y Operaciones/Comercio Minorista Supermercados
132006|Director De Departamento, Produccion Y Operaciones/Comercio Minorista Tiendas
132007|Director De Departamento, Produccion Y Operaciones/Reparac.
133001|Director De Departamento, Produccion Y Operaciones/Hoteles
133002|Director De Departamento, Produccion Y Operaciones/Restaura
134001|Director De Departamento, Produccion Y Operaciones/Almacena
134002|Director De Departamento, Produccion Y Operaciones/Comunicaciones
134003|Director De Departamento, Produccion Y Operaciones/Comunicaciones Correos
134004|Director De Departamento, Produccion Y Operaciones/Comunicaciones Telecomunicaciones
134005|Director De Departamento, Produccion Y Operaciones/Transporte
134006|Director De Departamento, Produccion Y Operaciones/Transporte Gasoductos Y Oleoductos
134007|Director De Departamento, Produccion Y Operaciones/Transporte Mercancías
134008|Director De Departamento, Produccion Y Operaciones/Transporte Pasajeros
135001|Director De Departamento, Produccion Y Operaciones/Actividades Culturales
135002|Director De Departamento, Produccion Y Operaciones/Actividades Deportivas
135003|Director De Departamento, Produccion Y Operaciones/Actividades Recreativas
135004|Director De Departamento, Produccion Y Operaciones/Administ
135005|Director De Departamento, Produccion Y Operaciones/Agencias
135006|Director De Departamento, Produccion Y Operaciones/Espectac
135007|Director De Departamento, Produccion Y Operaciones/Instituc
135008|Director De Departamento, Produccion Y Operaciones/Salud
135009|Director De Departamento, Produccion Y Operaciones/Servicio
135010|Director De Departamento, Produccion Y Operaciones/Trabajo
135011|Director De Plato, Cine
135012|Director Teatral
135013|Director, Musical
135014|Productor, Cine
135015|Productor, Radio
135016|Productor, Teatro
135017|Productor, Television
135018|Regidor, Teatro
136001|Decano
136002|Decano De Facultad
136003|Director De Centro Educativo
136004|Director De Escuela Profesional
136005|Director De Esep/Senati, Etc.
136006|Director De Estudios
136007|Director De Instituto Academico
136008|Director De Nucleos Educativos Comunales
136009|Director De La Unidad De Servicios Educativos
136010|Director Departamental De Educacion
136011|Director Universitario
136012|Rector
136013|Vice-Rector
137001|Director De Departamento, Administracion
137002|Director De Departamento, Contabilidad
137003|Director De Departamento, Finanzas/Gerente
137004|Director De Departamento, Presupuesto
137005|Gerente De Administracion
137006|Gerente De Creditos
138001|Director De Departamento, Personal
138002|Director De Departamento, Publicidad
138003|Director De Departamento, Relaciones Industriales
138004|Director De Departamento, Relaciones Laborales
138005|Director De Departamento, Relaciones Publicas
139001|Director De Departamento, Abastecimiento/Suministro
139002|Director De Departamento, Almacenamiento
139003|Director De Departamento, Comercializacion
139004|Director De Departamento, Compras/Adquisicion
139005|Director De Departamento, Distribucion
139006|Director De Departamento, Informatica
139007|Director De Departamento, Investigacion Y Desarrollo
139008|Director De Departamento, Ventas
139009|Director De Departamento, Ventas/ Organizacion
139010|Gerente De Comercializacion
139011|Gerente De Ventas
141001|Gerente, Agricultura
141002|Gerente, Caza
141003|Gerente, Explotacion: Agricola, Forestal Y Pecuaria
141004|Gerente, Pesca
141005|Gerente, Silvicultura
142001|Gerente, Explotacion De Minas Y Canteras
142002|Gerente, Industria Manufacturera
142003|Gerente, Suministro De Electricidad, Gas Y Agua
143001|Gerente, Construccion
144001|Comerciante, Mayorista
144002|Comerciante, Minorista
144003|Gerente, Comercio Mayorista
144004|Gerente, Comercio Mayorista/ Exportacion
144005|Gerente, Comercio Mayorista/ Importacion
144006|Gerente, Comercio Minorista
144007|Gerente, Comercio Minorista/ Cadena De Almacenes
144008|Gerente, Comercio Minorista/ Tiendas
144009|Gerente, Comercio Minorista/ Tiendas (Autoservicio)
144010|Gerente, Comercio Minorista/ Tiendas (Ventas Con Descuentos
144011|Gerente, Comercio Minorista/ Tiendas (Ventas Por Correo)
144012|Gerente Reparacion De Vehiculos, Auto Motores, Motocicletas
144013|Gerente, Tienda
145001|Administrador, Comercio Nep
145002|Director, Comercio Nep
145003|Concesionario-Adm., Rest. Y Cafeteria (Fab. Y Ofic.)
145004|Concesionario-Adm., Rest. Y Bar/Cafeteria (Tren, Barco, Avi
145005|Gerente, Comercio Nep
146001|Gerente, Albergue/ Jovenes
146002|Gerente, Bar/Discoteca Y Snack Bar
146003|Gerente, Cafe-Teatro
146004|Gerente, Cafeteria
146005|Gerente, Campamento/ Vacaciones
146006|Gerente, Cantina/ Empresa
146007|Gerente, Casa De Huespedes
146008|Gerente, Fonda
146009|Gerente, Hosteleria
146010|Gerente, Hotel
146011|Gerente, Motel
146012|Gerente, Parque De Caravanas
146013|Gerente, Pension
146014|Gerente, Peña
146015|Gerente, Restaurante
146016|Gerente, Restaurante-Bar
146017|Gerente, Restaurante/ Autoservicio
146018|Gerente, Snack-Bar
146019|Gerente, Taberna
147001|Gerente, Almacenamiento
147002|Gerente, Comunicaciones
147003|Gerente, Transporte
148001|Geren.-Adm., Agencia De Limpieza Y Desinfeccion
148002|Geren.-Adm., Agencia De Pompas Funebres
148003|Geren.-Adm., Agencia De Proteccion Y Seguridad
148004|Geren.-Adm., Agencia De Turismo/Excursiones
148005|Geren.-Adm., Agencia De Servicios/Excepto:Bares, Hotel Y Si
148006|Geren.-Adm., Centro De Estetica
148007|Geren.-Adm., Centro De Recreacion
148008|Geren.-Adm., Gimnasio
148009|Geren.-Adm., Lavanderia
148010|Geren.-Adm., Talleres/Medianos Y Pequeðos
211001|Astrofisico
211002|Astronomo
211003|Fisico
211004|Fisico, Acustica
211005|Fisico, Electricidad Y Magnetismo
211006|Fisico, Electronica
211007|Fisico, Estatica
211008|Fisico, Energia Solar (No Convencional)
211009|Fisico, Energia Nuclear
211010|Fisico, Fisica Nuclear
211011|Fisico, Fisica Teorica
211012|Fisico, Matematico
211013|Fisico, Mecanica
211014|Fisico, Optica
211015|Fisico, Sonido
211016|Fisico, Termodinamica
211017|Fisico, Otro
212001|Cosmografo
212002|Cosmologo
212003|Climatologo
212004|Meteorologo
212005|Meteorologo, Climatologia
212006|Meteorologo, Prevision Del Tiempo
213001|Quimico
213002|Quimico Analista
213003|Quimico, Colorantes
213004|Quimico, Control De Calidad
213005|Quimico, Corrosion
213006|Quimico, Cueros Y Pieles
213007|Quimico, Detergentes
213008|Quimico, Electroquimica
213009|Quimico, Farmacia
213010|Quimico, Farmacia/ Industria
213011|Quimico, Fisica/Otros
213012|Quimico, Industria Del Vidrio
213013|Quimico, Industria Metalurgica
213014|Quimico, Quimica Analitica
213015|Quimico, Quimica Inorganica
213016|Quimico, Quimica Mineral
213017|Quimico, Quimica Organica
213018|Quimico, Textiles
213019|Quimico, Tinturas
213020|Quimico, Otros (No Incluye Ing. Quimico)
214001|Estratigrafista
214002|Geodesia
214003|Geofisico (Incluye Ingenieros)
214004|Geofisico, Geomorfologia
214005|Geofisico, Hidrologia
214006|Geofisico, Oceanografia
214007|Geofisico, Sismologia
214008|Geofisico, Vulcanologia
214009|Geologo (Incluye Ingenieros)
214010|Geologo, Estratigrafia
214011|Geologo, Minas
214012|Geologo, Oceanografia
214013|Geologo, Paleontologia
214014|Geologo, Petroleo
214015|Geomorfologo
214016|Hidrologo
214017|Micropaleontologo
214018|Mineralogista
214019|Oceanografo, Geofisica
214020|Oceanografo, Geologia
214021|Paleontologo
214022|Petrologo
214023|Sismologo
214024|Vulcanologo
215001|Actuario
215002|Matematico, Analisis Actuarial
215003|Matematico, Matematica Aplicada
215004|Matematico, Matematica Pura
215005|Matematico-Analista, Investigacion Operativa
216001|Bioestadistico
216002|Biometrista
216003|Demografo
216004|Estadistico
216005|Estadistico, Agricultura
216006|Estadistico, Bioestadistica
216007|Estadistico, Biometria
216008|Estadistico, Economia
216009|Estadistico, Encuestas
216010|Estadistico, Encuestas Por Sondeo
216011|Estadistico, Estadistica Aplicada
216012|Estadistico, Finanzas
216013|Estadistico, Investigacion
216014|Estadistico, Matematico
216015|Estadistico, Muestrista
216016|Ingeniero, Estadistico
217001|Administrador, Banco De Datos
217002|Analista, Sistemas Informaticos
217003|Analista, Sistemas Informaticos/Banco De Datos
217004|Analista, Sistemas Informaticos/Computadoras
217005|Analista, Sistemas Informaticos/Telecomunicaciones
217006|Analistas, Transmisiones/Sistemas Informaticos
217007|Ingeniero, Sistemas Informaticos
217008|Ingeniero, Aplicaciones De La Informatica
218001|Arquitecto, Edificios
218002|Arquitecto, Interiores De Edificios
218003|Ingeniero, De Transporte
218004|Planificador, Transito
218005|Urbanista
219001|Ingeniero Civil
219002|Ingeniero Civil, Construccion
219003|Ingeniero Civil, Construccion Y Obras Publicas
219004|Ingeniero Civil, Construccion/Aerodromos
219005|Ingeniero Civil, Construccion/Aeropuertos
219006|Ingeniero Civil, Construccion/Calles
219007|Ingeniero Civil, Construccion/Carreteras Y Autopistas
219008|Ingeniero Civil, Construccion/Chimeneas De Fabricas
219009|Ingeniero Civil, Construccion/Edificios Y/O Viviendas
219010|Ingeniero Civil, Construccion/Estructuras De Edificios
219011|Ingeniero Civil, Construccion/Estructuras Metalicas
219012|Ingeniero Civil, Construccion/Vias Ferreas
219013|Ingeniero Civil, Construccion/Instalaciones Portuarias
219014|Ingeniero Civil, Construccion/Muelles Y Puertos
219015|Ingeniero Civil, Construccion/Puentes
219016|Ingeniero Civil, Construccion/Torres
219017|Ingeniero Civil, Construccion/Tuneles
219018|Ingeniero Civil, Contratistas De Obras
219019|Ingeniero Civil, Inspector De Obras
219020|Ingeniero Civil, Irrigacion
219021|Ingeniero Civil, Mecanica/Suelos
219022|Ingeniero Civil, Trabajos Maritimos
219023|Ingeniero, Canales Y Puertos
219024|Ingeniero, Hidraulico
219025|Ingeniero, Hidrologia
219026|Ingeniero, Irrigacion
219027|Ingeniero, Sanitario
221001|Electrotecnico Superior
221002|Ingeniero Electricista
221003|Ingeniero Electricista, Alto Voltaje
221004|Ingeniero Electricista, Equipo Electromecanico
221005|Ingeniero Electricista, Equipo Electromecanico De Baja Pote
221006|Ingeniero Electricista, Iluminacion
221007|Ingeniero Electricista, Lineas Electricas
221008|Ingeniero Electricista, Produccion De Energia
221009|Ingeniero Electricista, Produccion De Energia Electrica
221010|Ingeniero Electricista, Traccion Electrica
221011|Ingeniero Electricista, Transporte De Corriente Electrica
221012|Ingeniero Electricista, Transporte Y Distribucion Energia
221013|Tecnologo Electricidad
221014|Ingeniero Electronico, Construccion De Computadoras
221015|Ingeniero De Ordenadores Electronicos
221016|Ingeniero De Controles Industriales Y Electronica
221017|Ingeniero Electronico, Semiconductores
221018|Ingeniero De Calculadoras Electronicas
221019|Ingeniero Electronico
221020|Ingeniero Telecomunicaciones
221021|Ingeniero Telecomunicaciones/Radar
221022|Ingeniero Telecomunicaciones/Radio
221023|Ingeniero Telecomunicaciones/Sistemas De Seðales
221024|Ingeniero Telecomunicaciones/Telefonos
221025|Ingeniero Telecomunicaciones/Telegrafos
221026|Ingeniero Telecomunicaciones/Television
222001|Ingeniero Mecanico
222002|Ingeniero Mecanico, Aeronautica
222003|Ingeniero Mecanico, Agricultura (Ing. Agricola)
222004|Ingeniero Mecanico, Automotores
222005|Ingeniero Mecanico, Automoviles
222006|Ingeniero Mecanico, Calefaccion, Ventilacion Y Refrigeracio
222007|Ingeniero Mecanico, Climatizacion
222008|Ingeniero Mecanico, Construccion Naval
222009|Ingeniero Mecanico, Energia Nuclear
222010|Ingeniero Mecanico Y Electricista
222011|Ingeniero Mecanico, Maquinaria Y Herramientas Industriales
222012|Ingeniero Mecanico, Motores A Reaccion
222013|Ingeniero Mecanico, Motores Diesel Y/O Propulsion A Chorro
222014|Ingeniero Mecanico, Motores De Combustion Interna
222015|Ingeniero Mecanico, Motores Marinos
222016|Ingeniero Mecanico, Motores/Equipo Para Barcos
222017|Ingeniero Mecanico, Motores/Excepto Los Marinos
222018|Ingeniero Mecanico, Motores/Locomotoras A Vapor
222019|Ingeniero Mecanico, De Fluidos
222020|Ingeniero Mecanico, Turbinas De Gas
222021|Ingeniero, Calefaccion, Ventilacion Y Refrigeracion
222022|Ingeniero, Climatizacion
222023|Ingeniero, Construccion Aeronautica
222024|Ingeniero, Construccion De Automoviles
222025|Ingeniero, Construccion Naval
222026|Ingeniero, Frio Industrial
222027|Ingeniero, Maquinaria Y Herramientas Industriales
223001|Ingeniero Bioquimico Industrial
223002|Ingeniero Quimico En Industria Quimica
223003|Ingeniero Quimico, Alimentos Y Bebidas
223004|Ingeniero Quimico, Antibioticos
223005|Ingeniero Quimico, Explosivos
223006|Ingeniero Quimico, Carburantes/Refineria De Petroleo
223007|Ingeniero Quimico, Caucho
223008|Ingeniero Quimico, Colores Y Pinturas
223009|Ingeniero Quimico, Fabricacion
223010|Ingeniero Quimico, Fibras Textiles (Ing. Textil)
223011|Ingeniero Quimico, Gas/Produccion Y Distribucion
223012|Ingeniero Quimico, Material Plastico
223013|Ingeniero Quimico, Papel
223014|Ingeniero Quimico, Perfumista
223015|Ingeniero Quimico, Petroleo Y Gas Natural
223016|Ingeniero Quimico, Tecnologia De Los Combustibles
223017|Ingeniero Quimico, Otros
223018|Ingeniero, Petroquimico
224001|Ingeniero Metalurgico
224002|Ingeniero Metalurgico, Minerales Radiactivos Y Fundicion
224003|Ingeniero Metalurgico, Produccion Y Afino/Metales
224004|Ingeniero Metalurgico, Tratamiento De Los Metales
224005|Ingeniero, Metalurgico/Otros
225001|Ingeniero, Minas
225002|Ingeniero, Minas/Carbon
225003|Ingeniero, Minas/Minerales Metalicos
225004|Ingeniero, Minas/Minerales No Metalicos
225005|Ingeniero, Minas/Petroleo Y Gas Natural
225006|Ingeniero, Perforacion/Pozos De Petroleo Y De Gas
225007|Ingeniero, Siderurgico
225008|Ingeniero De Minas, Otros
226001|Agrimensor
226002|Agrimensor, Aerofotografo
226003|Agrimensor, Marina
226004|Agrimensor, Geodesico
226005|Agrimensor, Hidrografico
226006|Agrimensor, Minas
226007|Agrimensor, Topografia
226008|Agrimensor, Topografia Aerea
226009|Cartografo
226010|Cartografo, Marina
226011|Fotogrametrista Y Aerofotogrametista
226012|Topografo, Fotogeometria
226013|Topografo, Hidrografico
226014|Topografo, (Suelos)
227001|Ingeniero, Administrativo
227002|Ingeniero, Sistemas/Excepto Informaticos
227003|Creador, Sistemas/Excepto Informaticos
227004|Ingeniero Consultor, Organizacion Industrial
227005|Ingeniero Industrial
227006|Ingeniero Industrial, Higiene Y Seguridad Industrial
227007|Ingeniero, Organizacion De Estudio De Tiempos Y Movimientos
227008|Ingeniero, Organizacion Industrial
227009|Ingeniero, Organizacion Y Metodos
227010|Ingeniero, Organizacion Calculo De Costos
227011|Ingeniero, Organizacion Y Planificacion De Empresas
228001|Ingeniero Pesquero
229001|Ingeniero, Cuero Y Calzado
229002|Ingeniero, Ceramica Y Vidrios
229003|Ingeniero, Control De Calidad
229004|Ingeniero, Industrias Alimentarias
229005|Ingeniero, Industrias De Papel
229006|Ingeniero, Medio Ambiente
229007|Ingeniero, Produccion
229008|Ingeniero, Planificador De Trafico
229009|Ingeniero, Topografo
229010|Ingeniero, De Vuelo
229011|Ingeniero (No Clasificado En Otras Clasificaciones)
231001|Bacteriologo
231002|Bacteriologo, Agricultura
231003|Bacteriologo, Alimentacion
231004|Bacteriologo, Farmacia
231005|Bacteriologo, Industria
231006|Bacteriologo, Industria, Lacteas
231007|Bacteriologo, Medicina
231008|Bacteriologo, Medicina/Veterinaria
231009|Bacteriologo, Pesca
231010|Bacteriologo, Suelos
231011|Biologo
231012|Biologo Molecular
231013|Biologo, Fauna De Agua Dulce
231014|Biologo, Fauna Marina
231015|Biologo, Genetica
231016|Biologo, Hidrobiologia
231017|Botanico
231018|Botanico, Ecologia
231019|Botanico, Economista
231020|Botanico, Genetica
231021|Botanico, Histologia
231022|Botanico, Micologia
231023|Botanico, Suelos
231024|Botanico, Taxonomia
231025|Citologo
231026|Citologo, Botanica
231027|Citologo, Zoologia
231028|Ecologista
231029|Ecologista, Botanica
231030|Ecologista, Zoologia
231031|Embriologo
231032|Entomologo
231033|Genetista
231034|Genetista, Botanica
231035|Genetista, Zoologo
231036|Hidrobiologo
231037|Histologo
231038|Histologo, Animales
231039|Histologo, Plantas
231040|Ictiologo
231041|Micologo
231042|Microbiologo
231043|Ornitologo
231044|Parasitologo
231045|Piscicultor De Las Ciencias Biologicas
231046|Taxonomista
231047|Taxonomista, Animales
231048|Taxonomista, Plantas
231049|Zoologo
231050|Zoologo, Embriologia
231051|Zoologo, Entomologia
231052|Zoologo, Histologia
231053|Zoologo, Ictiologia
231054|Zoologo, Mamalogista
231055|Zoologo, Ornitologia
231056|Zoologo, Parasitologia
231057|Zoologo, Piscicultura
231058|Zoologo, Taxonomia
232001|Anatomista
232002|Biofisico
232003|Bioquimico
232004|Epidemiologo
232005|Farmacologo
232006|Fisiologo
232007|Fisiologo, Animales
232008|Fisiologo, Endocrinologia
232009|Fisiologo, Epidemiologia
232010|Fisiologo, Otros
232011|Histopatologo
232012|Neuropatologo
233001|Bromatologos
233002|Dietistas-Nutricionistas
234001|Agrologo
234002|Agronomo
234003|Agronomo, Arboricultor
234004|Agronomo, Conservacion De La Naturaleza
234005|Agronomo, Ecologo
234006|Agronomo, Edafologia
234007|Agronomo, Floricultor
234008|Agronomo, Horticultura
234009|Agronomo, Oleicultor
234010|Agronomo, Silvicultura
234011|Ingeniero Agroindustrial
234012|Ingeniero Agronomo
234013|Ingeniero Edafologo
234014|Ingeniero Forestal
234015|Zootecnico (Incluye Ingenieros)
235001|Alienista
235002|Alopata
235003|Anestesista
235004|Cardiologo
235005|Cirujano
235006|Cirujano, Cardiologia
235007|Cirujano, Cirugia General
235008|Cirujano, Cirugia Plastica
235009|Cirujano, Neurocirugia
235010|Cirujano, Ortopedia
235011|Cirujano, Osteopata
235012|Cirujano Plastico
235013|Cirujano, Torax
235014|Dermatologo
235015|Ginecologo
235016|Medico
235017|Medico, Acupuntura
235018|Medico, Anestesia
235019|Medico, Cardiologia
235020|Medico, Dermatologia
235021|Medico, Endocrinologo
235022|Medico, Estomatologia
235023|Medico Forense
235024|Medico, Gastroenterologo
235025|Medico, Geriatra
235026|Medico, Ginecologia
235027|Medico, Laringologo
235028|Medico, Medicina General
235029|Medico, Nefrologo
235030|Medico, Neumologo
235031|Medico, Neurologo
235032|Medico, Obstetra
235033|Medico, Oftalmologia (Oculista)
235034|Medico, Osteopatia
235035|Medico, Otorrinolaringologia
235036|Medico, Patologo
235037|Medico, Pediatria
235038|Medico, Psiquiatria
235039|Medico, Puericultor
235040|Medico, Radiologia
235041|Medico, Urologo
235042|Medico, Venereologo
235043|Neurocirujano
235044|Oftalmologo
235045|Ortofonia, Especialista
235046|Ortoptia, Especialista
235047|Otorrinolaringologo
235048|Pediatra
235049|Psiquiatra
236001|Cirujano, Bucodental
236002|Cirujano, Dentista
236003|Dentista
236004|Dentista, Protesis Dentales
236005|Medico, Odontologo
236006|Odontologo
236007|Odontologo, Endodoncia
236008|Odontologo, Ortodoncia
236009|Odontologo, Pedodoncia
236010|Odontologo, Periodoncia
237001|Veterinario
237002|Veterinario, Cirugia
237003|Veterinario, Epidemiologia
237004|Veterinario, Salud Publica, Profesional
237005|Veterinario, Otros
238001|Farmaceutico
238002|Farmaceutico, Comercio
238003|Farmaceutico, Hospital
238004|Quimico-Farmaceutico
239001|Enfermera, Tecnico
239002|Enfermera, Tecmico
239003|Enfermera, Nivel Superior/Clinica
239004|Enfermera, Nivel Superior/Consultorio
239005|Enfermera, Nivel Superior/Hospital
239006|Enfermera, Nivel Superior/Maternidad
239007|Enfermera, Nivel Superior/Obstetricia
239008|Enfermero, Nivel Superior (Diplomados)
239009|Enfermero, Nivel Superior
239010|Enfermero, Nivel Superior/Clinica
239011|Enfermero, Nivel Superior/Hospital
241001|Profesor, Educacion Superior
241002|Profesor, Educacion Superior/Administracion
241003|Profesor, Educacion Superior/Agricultura
241004|Profesor, Educacion Superior/Agronomia
241005|Profesor, Educacion Superior/Anatomia
241006|Profesor, Educacion Superior/Antropologia
241007|Profesor, Educacion Superior/Arqueologia
241008|Profesor, Educacion Superior/Arquitectura
241009|Profesor, Educacion Superior/Arte Dramatico
241010|Profesor, Educacion Superior/Artes Industriales
241011|Profesor, Educacion Superior/Astronomia
241012|Profesor, Educacion Superior/Bacteriologia
241013|Profesor, Educacion Superior/Bellas Artes
241014|Profesor, Educacion Superior/Biblioteconomia
241015|Profesor, Educacion Superior/Biologia
241016|Profesor, Educacion Superior/Bioquimica
241017|Profesor, Educacion Superior/Botanica
241018|Profesor, Educacion Superior/Ciencias Agronomicas
241019|Profesor, Educacion Superior/Ciencias Biologicas
241020|Profesor, Educacion Superior/Ciencias Economicas
241021|Profesor, Educacion Superior/Ciencias Fisicas Y Quimicas
241022|Profesor, Educacion Superior/Ciencias Forenses
241023|Profesor, Educacion Superior/Ciencias Matematicas
241024|Profesor, Educacion Superior/Ciencias Mecanicas
241025|Profesor, Educacion Superior/Ciencias Medicas
241026|Profesor, Educacion Superior/Ciencias Militares
241027|Profesor, Educacion Superior/Ciencias Politicas
241028|Profesor, Educacion Superior/Ciencias Sociales
241029|Profesor, Educacion Superior/Ciencias Tecnicas
241030|Profesor, Educacion Superior/Ciencias Tecnicas (Electricida
241031|Profesor, Educacion Superior/Ciencias Tecnicas (Electronica
241032|Profesor, Educacion Superior/Ciencias Tecnicas (Ingenieria
241033|Profesor, Educacion Superior/Ciencias Tecnicas (Quimica)
241034|Profesor, Educacion Superior/Ciencias Tecnicas (Tecnologia
241035|Profesor, Educacion Superior/Ciencias Tecnicas (Tecnologia)
241036|Profesor, Educacion Superior/Ciencias Tecnicas (Telecomunic
241037|Profesor, Educacion Superior/Comercializacion
241038|Profesor, Educacion Superior/Conservatorio
241039|Profesor, Educacion Superior/Contabilidad
241040|Profesor, Educacion Superior/Cooperativismo
241041|Profesor, Educacion Superior/Cria De Ganado
241042|Profesor, Educacion Superior/Demografia
241043|Profesor, Educacion Superior/Derecho
241044|Profesor, Educacion Superior/Dibujo Industrial
241045|Profesor, Educacion Superior/Dietetica
241046|Profesor, Educacion Superior/Economia
241047|Profesor, Educacion Superior/Economia Domestica
241048|Profesor, Educacion Superior/Economia Y Comercio
241049|Profesor, Educacion Superior/Educacion Fisica
241050|Profesor, Educacion Superior/Elaboracion De Alimentos
241051|Profesor, Educacion Superior/Enfermeria
241052|Profesor, Educacion Superior/Entomologia
241053|Profesor, Educacion Superior/Ergoterapia
241054|Profesor, Educacion Superior/Escuela De Policia
241055|Profesor, Educacion Superior/Escultura
241056|Profesor, Educacion Superior/Especializado En Coop.Agraria,
241057|Profesor, Educacion Superior/Estadistica
241058|Profesor, Educacion Superior/Estudios Comerciales
241059|Profesor, Educacion Superior/Estudios Internacionales
241060|Profesor, Educacion Superior/Farmacia
241061|Profesor, Educacion Superior/Farmacologia
241062|Profesor, Educacion Superior/Filologia
241063|Profesor, Educacion Superior/Filosofia
241064|Profesor, Educacion Superior/Finanzas
241065|Profesor, Educacion Superior/Fisica
241066|Profesor, Educacion Superior/Fisioterapia
241067|Profesor, Educacion Superior/Geodesia
241068|Profesor, Educacion Superior/Geofisica
241069|Profesor, Educacion Superior/Geografia
241070|Profesor, Educacion Superior/Geologia
241071|Profesor, Educacion Superior/Historia
241072|Profesor, Educacion Superior/Historia Del Arte
241073|Profesor, Educacion Superior/Horticultura
241074|Profesor, Educacion Superior/Idiomas Y Linguistica
241075|Profesor, Educacion Superior/Informatica
241076|Profesor, Educacion Superior/Ingenieria Y Arquitectura
241077|Profesor, Educacion Superior/Lengua Y Literatura
241078|Profesor, Educacion Superior/Letras
241079|Profesor, Educacion Superior/Linguistica
241080|Profesor, Educacion Superior/Literatura
241081|Profesor, Educacion Superior/Matematicas
241082|Profesor, Educacion Superior/Medicina
241083|Profesor, Educacion Superior/Medicina Forense
241084|Profesor, Educacion Superior/Medicina Veterinaria
241085|Profesor, Educacion Superior/Metalurgia
241086|Profesor, Educacion Superior/Meteorologia
241087|Profesor, Educacion Superior/Metodos De Venta
241088|Profesor, Educacion Superior/Mineria
241089|Profesor, Educacion Superior/Musica
241090|Profesor, Educacion Superior/Navegacion Aerea
241091|Profesor, Educacion Superior/Navegacion Maritima
241092|Profesor, Educacion Superior/Observacion Meteorologica
241093|Profesor, Educacion Superior/Obstetricia
241094|Profesor, Educacion Superior/Odontologia
241095|Profesor, Educacion Superior/Optometria
241096|Profesor, Educacion Superior/Osteopatia
241097|Profesor, Educacion Superior/Patologia
241098|Profesor, Educacion Superior/Pedagogia
241099|Profesor, Educacion Superior/Periodismo
241100|Profesor, Educacion Superior/Pesca
241101|Profesor, Educacion Superior/Pintura Artistica
241102|Profesor, Educacion Superior/Planificacion Familiar
241103|Profesor, Educacion Superior/Planificacion Industrial
241104|Profesor, Educacion Superior/Prehistoria
241105|Profesor, Educacion Superior/Programa De Urbanismo
241106|Profesor, Educacion Superior/Programacion De Computadoras
241107|Profesor, Educacion Superior/Psicologia
241108|Profesor, Educacion Superior/Publicidad E Informacion Publi
241109|Profesor, Educacion Superior/Quimica
241110|Profesor, Educacion Superior/Quiropractica
241111|Profesor, Educacion Superior/Radiologia
241112|Profesor, Educacion Superior/Relaciones Publicas
241113|Profesor, Educacion Superior/Servicios De Telecomunicacione
241114|Profesor, Educacion Superior/Silvicultura
241115|Profesor, Educacion Superior/Sociologia
241116|Profesor, Educacion Superior/Teologia
241117|Profesor, Educacion Superior/Teoria Y Practica Bancaria
241118|Profesor, Educacion Superior/Terapeutica Paramedica
241119|Profesor, Educacion Superior/Tratamientos Medicos
241120|Profesor, Educacion Superior/Turismo (Escuela De Turismo)
241121|Profesor, Educacion Superior/Zoologia
241122|Profesor, Universidad, Otros
242001|Profesor, Educacion Secundaria
242002|Profesor, Educacion Secundaria/Agricultura
242003|Profesor, Educacion Secundaria/Alfabetizacion De Adultos
242004|Profesor, Educacion Secundaria/Artes Manuales
242005|Profesor, Educacion Secundaria/Arte-Oficios
242006|Profesor, Educacion Secundaria/Artesania
242007|Profesor, Educacion Secundaria/Bellas Artes
242008|Profesor, Educacion Secundaria/Biologia
242009|Profesor, Educacion Secundaria/Botanica
242010|Profesor, Educacion Secundaria/Ciencias Naturales
242011|Profesor, Educacion Secundaria/Ciencias Sociales
242012|Profesor, Educacion Secundaria/Comercio Y Secretariado
242013|Profesor, Educacion Secundaria/Contabilidad Mercantil
242014|Profesor, Educacion Secundaria/Costura
242015|Profesor, Educacion Secundaria/Dibujo Tecnico
242016|Profesor, Educacion Secundaria/Ebanisteria
242017|Profesor, Educacion Secundaria/Economia Domestica
242018|Profesor, Educacion Secundaria/Educacion Civica
242019|Profesor, Educacion Secundaria/Educacion Fisica
242020|Profesor, Educacion Secundaria/Enfermeria Basica
242021|Profesor, Educacion Secundaria/Filosofia
242022|Profesor, Educacion Secundaria/Fisica
242023|Profesor, Educacion Secundaria/Formacion Profesional
242024|Profesor, Educacion Secundaria/Geografia
242025|Profesor, Educacion Secundaria/Geologia
242026|Profesor, Educacion Secundaria/Historia
242027|Profesor, Educacion Secundaria/Historia Del Arte
242028|Profesor, Educacion Secundaria/Labores
242029|Profesor, Educacion Secundaria/Labra (Metales)
242030|Profesor, Educacion Secundaria/Lengua Y Literatura
242031|Profesor, Educacion Secundaria/Literatura
242032|Profesor, Enseñanza Secundaria/Matematicas
242033|Profesor, Educacion Secundaria/Mecanica
242034|Profesor, Educacion Secundaria/Mecanografia
242035|Profesor, Educacion Secundaria/Musica
242036|Profesor, Educacion Secundaria/Pedagogia
242037|Profesor, Educacion Secundaria/Programacion De Computadoras
242038|Profesor, Educacion Secundaria/Quimica
242039|Profesor, Educacion Secundaria/Religion
242040|Profesor, Educacion Secundaria/Secretariado
242041|Profesor, Educacion Secundaria/Sociologia
242042|Profesor, Educacion Secundaria/Talla (Madera)
242043|Profesor, Educacion Secundaria/Taquigrafia
242044|Profesor, Educacion Secundaria/Tecnica
242045|Profesor, Educacion Secundaria/Tecnologica
242046|Profesor, Educacion Secundaria/Zoologia
242047|Profesor, Educacion Secundaria/Otros
243001|Maestro De Enseñanza Primaria
243002|Maestro De Escuela
243003|Normalista
243004|Profesor De Enseñanza Primaria
244001|Profesor(A) De Escuela Maternal O Cuna (Guarderia)
244002|Profesor(A) De Jardin De Infancia
244003|Profesor(A) De Parvulos
244004|Profesor De Educacion Inicial (Pre-Escolar)
245001|Profesor De Alumnos Fisicamente Deficientes
245002|Profesor De Alumnos Mentalmente Deficientes
245003|Profesor De Ciegos
245004|Profesor De Mudos
245005|Profesor De Niños Excepcionales
245006|Profesor De Sordos
246001|Profesor De Academia
246002|Profesor De Cenecape
246003|Profesor De Senati Y Tecsup
246004|Profesor De Talleres, Otros
247001|Asesor, Metodos De Enseñanza
247002|Auxiliar De Educacion (Encargado De Curso)
247003|Consejero De Educacion
247004|Consejero Vocacional
247005|Especialista, Enseðanza/Metodos Audiovisuales
247006|Inspector, Escuelas
247007|Institutriz
247008|Instructor De Manejo De Aparatos Electricos, Electronicos,
247009|Profesor Alfabetizador
247010|Profesor De Baile
247011|Profesor De Idiomas
247012|Profesores, Otros
251001|Asesor Contable
251002|Auditor
251003|Contador
251004|Contador, Auditoria De Empresas
251005|Contador, Contabilidad Municipal
251006|Contador, Costos
251007|Contador, Costos Y Precios
251008|Contador, Empresa
251009|Interventor, Cuentas
251010|Perito Contable
252001|Administrador De Empresas
252002|Especialista En Cooperativas
252003|Administradores, Otros
253001|Analista, Ocupaciones
253002|Analista, Profesiones
253003|Analista, Puestos De Trabajo
253004|Conciliador, Laboral
253005|Conciliador, Relaciones Laborales
253006|Consejero, Empleo
253007|Consejero, Orientacion Profesional
253008|Consejero, Perspectivas De Carrera
253009|Entrevistador, Colocacion
253010|Especialista Cuestiones De Personal
253011|Especialista, Formacion Del Personal
253012|Especialista, Relaciones Profesionales
253013|Especialista, Seguridad En El Trabajo
254001|Abogado
254002|Abogado Patrocinante
254003|Abogado Penalista
254004|Abogado, Civil-Laboral/Derecho Privado
254005|Abogado, Criminalista/Derecho Publico (Constit.Penal, Admin
254006|Apoderado
254007|Abogado, Derecho Internacional
254008|Abogados Y Otros
254009|Asesor, Legal O Juridico
255011|Presidente, Tribunal De Justicia
256001|Agente Fiscal
257001|Notario Publico
258001|Consejero Juridico, Empresa
258002|Consejero Juridico, Impuestos
259001|Archivero, De Biblioteca Y Servicios De Archivos
259002|Archivero, Paleologo
259003|Conservador, Galeria De Arte
259004|Conservador, Museo
261001|Bibliotecario
261002|Documentalista
261003|Documentalista, Materias Economicas
261004|Documentalista, Materias Tecnicas
261005|Especialista, Biblioteconomia
262001|Econometrista
262002|Economista (Ingeniero)
262003|Economista, Agricultura
262004|Economista, Comercio Internacional
262005|Economista, Desarrollo
262006|Economista, Econometria
262007|Economista, Especialista En Mercadotecnia
262008|Economista, Otros
262009|Planificadores
263001|Antropologo
263002|Arqueologo
263003|Etnografo
263004|Etnologo
263005|Geneologista
263006|Historiador
263007|Historiador, Ciencias Sociales
263008|Historiador, Historia Economica
263009|Historiador, Historia Politica
263010|Politologo
263011|Sociologo, Criminologia
263012|Sociologo, Industria
263013|Sociologo, Patologia Social
264001|Geografo, Geografia Economica
264002|Geografo, Geografia Fisica
264003|Geografo, Geografia Politico
265001|Cientifico, Ciencias Politicas
265002|Especialista, Ciencias Politicas
265003|Filosofo
265004|Filosofo, Ciencias Politicas
266001|Argumentista, Teatro O Cine
266002|Autor
266003|Autor, Drama
266004|Autor, Letra De Canciones
266005|Autor, Teatro
266006|Biografo
266007|Comentarista, Actualidades
266008|Comentarista, Deportes
266009|Comentarista, Radio Y Television
266010|Corresponsal, Medios De Informacion
266011|Critico
266012|Critico, Arte
266013|Critico, Artes Plasticas
266014|Critico, Cinematografico
266015|Critico, Literario
266016|Critico, Musica
266017|Critico, Radio
266018|Critico, Teatro
266019|Critico, Television
266020|Cronista
266021|Cronista, Deportes
266022|Cronista, Tribunales
266023|Dialoguista
266024|Editor, Libros/Revistas
266025|Editorialista
266026|Ensayista
266027|Escritor
266028|Escritor, Libretos
266029|Escritor, Novelas
266030|Escritor, Poesia
266031|Escritor, Teatro
266032|Folletinista
266033|Gacetillero
266034|Guionista
266035|Hombres De Letras
266036|Libretista
266037|Literato
266038|Novelista
266039|Periodista
266040|Periodista Reportero
266041|Periodista, Radio
266042|Periodista, Television
266043|Poeta
266044|Redactor
266045|Redactor Jefe, Diarios
266046|Redactor Jefe, Finanzas
266047|Redactor Jefe, Guiones/Radio Y Television
266048|Redactor Jefe, Revistas
266049|Redactor, Articulos De Fondo
266050|Redactor, Informacion Publica
266051|Redactor, Modas
266052|Redactor, Prensa/T.V.
266053|Redactor, Prensa/Extranjero
266054|Redactor, Publicidad
266055|Redactor, Revistas
266056|Redactor, Tecnico
266057|Redactor, Tecnico/Manuales
266058|Reportero
266059|Reportero, Moda
266060|Reportero, Prensa/T.V. O Radio
266061|Jefe De Redaccion/Diario
266062|Jefe De Redaccion/Revista
267001|Especialista, Fonetica
267002|Especialista, Semantica
267003|Etimologista
267004|Filologo
267005|Filologo, Etimologia
267006|Filologo, Fonetica
267007|Filologo, Fonologia
267008|Filologo, Grafologia
267009|Filologo, Lexicografia
267010|Filologo, Linguistica
267011|Filologo, Morfologia
267012|Filologo, Semantica
267013|Grafologo
267014|Interprete
267015|Lexicografo
267016|Linguista
267017|Morfologo
267018|Traductor
268001|Psicologo
268002|Psicologo Clinico
268003|Psicologo, Experimentos
268004|Psicologo, Industrias
268005|Psicologo, Ocupaciones
268006|Psicologo, Pedagogia
268007|Psicologo, Problemas Sociales
268008|Psicologo, Trabajo
269001|Asistente Medico Social
269002|Asistente Social
269003|Asistente Social, Bienestar Social
269004|Asistente Social, Delincuencia
269005|Asistente Social, Delincuencia/Libertad Condicional
269006|Asistente Social, Delincuencia/Prevencion Y Rehabilitacion
269007|Asistente Social, Empresa
269008|Asistente Social, Hospital
269009|Asistente Social, Prisiones
269010|Asistente Social, Proteccion De La Familia
269011|Asistente Social, Proteccion De La Infancia
269012|Asistente Social, Psiquiatria
269013|Asistente Social, Rehabilitacion/Incapacitados Fisicos
269014|Asistente Social, Servicios Comunitarios
269015|Asistente Social, Servicios Culturales
269016|Asistente Social, Servicios De Ayuda Familiar
269017|Asistente Social, Servicios Sociales
269018|Visitador Social
269019|Visitador, Prisiones
271001|Acuarelista
271002|Artista Comercial
271003|Artista Creativo
271004|Artista Pintor
271005|Caricaturista
271006|Ceramista Artistico
271007|Creador, Dibujos Animados
271008|Creador, Modelos/Joyeria Y Orfebreria
271009|Dibujante, Caricaturista
271010|Dibujante, Dibujos Animados
271011|Dibujante, Diseño Industrial
271012|Dibujante, Joyeria Y Orfebreria
271013|Dibujante, Publicidad
271014|Escultor
271015|Estatuario
271016|Grabador Artistico
271017|Imaginero
271018|Maquetista
271019|Miniaturista
271020|Orfebre Artista
271021|Paisajista
271022|Pastelista
271023|Pintor, Agua Fuerte
271024|Pintor, Pintura Abstracta
271025|Pintor, Pintura Figurativa
271026|Publicista, Responsable De Campaða Publicitaria
271027|Restaurador, Cuadros
271028|Restaurador, Obras De Arte
271029|Retratista
272001|Adaptador Musical
272002|Armonista
272003|Arpista
272004|Artista Lirico
272005|Bajo
272006|Bajonista
272007|Baritono
272008|Baterista
272009|Cantante
272010|Cantante, Concierto
272011|Cantante, Coral
272012|Cantante, Jazz
272013|Cantante, Musica Popular
272014|Cantante, Opera
272015|Citarista
272016|Clarinetista
272017|Clavecinista
272018|Compositor
272019|Concertador, Coros
272020|Concertista Cantante
272021|Concertista Instrumentista
272022|Contrabajo
272023|Contralto
272024|Copista, Musica
272025|Corista
272026|Director, Coros
272027|Director, Orquesta Sinfonica
272028|Ejecutante, Musico
272029|Fagotista
272030|Flautista
272031|Guitarrista
272032|Instrumentista
272033|Mezzo-Soprano
272034|Oboista
272035|Organista
272036|Orquestador
272037|Percusionista
272038|Pianista
272039|Saxofonista
272040|Soprano
272041|Tamborilero
272042|Tenor
272043|Trombonista
272044|Trompetista
272045|Violinista
272046|Violonchelista
272047|Otros, Compositores, Musicos Y Cantantes
273001|Bailarin
273002|Bailarines De Danza Clasica Y Moderna
273003|Bailarin, Ballet
273004|Bailarin, Solista
273005|Bailarina
273006|Coreografo
273007|Director, Danza
273008|Director, Coreografia
273009|Maestro De Ballet
274001|Actor
274002|Actor, Cine
274003|Actor, Teatro
274004|Actriz
274005|Actriz, Cine
274006|Actriz, Teatro
274007|Caricato
274008|Comediante
274009|Director Artistico, Cine
274010|Director Artistico, Teatro
274011|Director De Produccion (Radio Y T.V.)
274012|Director, Escena/Cine
274013|Director, Escena/Teatro
274014|Director, Fotografia/Cine
274015|Director, Teatro
274016|Empresario, Cine
274017|Imitador, Cabaret
274018|Lector, Radio O Television
274019|Mimo
274020|Realizador, Radiodifusion O Television
274021|Recitador, Excepto Radio O Television
274022|Recitador, Radio O Television
274023|Regente, Escena
274024|Tragico
274025|Otros, Actores Y Directores De Cine, Radio, Teatro, Televis
281001|Profesional En Hoteleria
281002|Profesional En Turismo
282001|Relacionista, Industrial
282002|Relacionista, Laboral
282003|Relacionista, Publico
282004|Relacionista, Otros
283001|Diplomaticos, Extranjeros
283002|Diplomaticos, Peruanos (Excepto Embajadores Y Consules En F
283003|Representantes De Organismos Internacionales
284001|Arcipreste
284002|Arzobispo
284003|Bonzo
284004|Canonigo
284005|Capellan
284006|Cura
284007|Iman
284008|Ministro Del Culto
284009|Misionero
284010|Monja
284011|Monje
284012|Obispo
284013|Parroco
284014|Pastor Protestante
284015|Poojari
284016|Prior
284017|Rabino
284018|Sacerdote
284019|Sacerdote Budista
284020|Teologo
284021|Vicario
311001|Tecnico, Analista Quimico
311002|Tecnico, Astronomia
311003|Tecnico, Fisica/Investigacion (Ciencias Fisicas)
311004|Tecnico, Geofisica
311005|Tecnico, Geologia
311006|Tecnico, Laboratorista Fisico O Quimico
311007|Tecnico, Meteorologia
311008|Tecnico, Oceanografia
311009|Tecnico, Quimica/Investigacion (Ciencias Quimicas)
311010|Tecnico, Especialista En Fisico-Quimica
312001|Aparejador, Ingenieria Civil
312002|Tecnico Calculista, Ingenieria Civil/Costo De Construccion
312003|Tecnico, Agrimensor
312004|Tecnico, Auxiliar De Arquitectura
312005|Tecnico, Cartografo
312006|Tecnico, Fotogrametrista Y Aerofotogrametrista
312007|Tecnico, Ingenieria Civil
312008|Tecnico, Ingenieria Civil/Construccion De Viviendas Y Edifi
312009|Tecnico, Ingenieria Civil/Contratista (Construccion)
312010|Tecnico, Ingenieria Civil/Estructuras
312011|Tecnico, Ingenieria Civil/Hidraulica
312012|Tecnico, Ingenieria Civil/Irrigacion
312013|Tecnico, Ingenieria Civil/Mecanica De Suelos
312014|Tecnico, Ingenieria Civil/Sanitaria
313001|Tecnico, Electricista
313002|Tecnico Electricista, Alta Tension
313003|Tecnico Electricista, Energia Electrica/Distribucion
313004|Tecnico Electricista, Radio Y/O T.V.
313005|Tecnico Electricista, Iluminacion
313006|Tecnico Electricista, Sonido
313007|Tecnico, Ingenieria Electrica
313008|Tecnico Calculista, Ingenieria Electronica
313009|Tecnico, Ingenieria Electronica
313010|Tecnico, Sistemas Electricos De Aeronaves
313011|Tecnico, Telecomunicaciones
313012|Tecnico, Operador De Radar
313013|Tecnico, Telecomunicaciones/Radio
313014|Tecnico, Telecomunicaciones/Sistemas De Seðales
313015|Tecnico, Telecomunicaciones/Telefono
313016|Tecnico, Telecomunicaciones/Telegrafo
313017|Tecnico, Telecomunicaciones/Television
314001|Tecnico Calculista, Construccion Mecanica
314002|Tecnico Aeronautico
314003|Tecnico Inspector, Naval
314004|Tecnico Inspector, Naval/Buques
314005|Tecnico Mecanico
314006|Tecnico Mecanico, Acondicionamiento De Aire
314007|Tecnico Mecanico, Aeronautica
314008|Tecnico Mecanico, Agricultura
314009|Tecnico Mecanico, Automoviles
314010|Tecnico Mecanico, Calefaccion, Refrigeracion Y Ventilacion
314011|Tecnico Mecanico, Construccion Naval
314012|Tecnico Mecanico, Energia Nuclear
314013|Tecnico Mecanico, Instructor De Vehiculos Automotores
314014|Tecnico Mecanico, Instrumentos
314015|Tecnico Mecanico, Lubricacion
314016|Tecnico Mecanico, Maquinaria Y Herramientas Industriales
314017|Tecnico Mecanico, Mantenimiento De Avion
314018|Tecnico Mecanico, Motores
314019|Tecnico Mecanico, Motores De Combustion Interna
314020|Tecnico Mecanico, Motores De Locomotoras
314021|Tecnico Mecanico, Motores De Propulsion A Chorro
314022|Tecnico Mecanico, Motores Diesel
314023|Tecnico Mecanico, Sistemas Hidraulicos
314024|Tecnico Mecanico, Turbinas De Gas
314025|Tecnico, Acondicionamiento De Aire
314026|Verificador, Naval
315001|Estimador, Quimica Industrial
315002|Tecnico, Fibra Textil (De Ing. Textil)
315003|Tecnico, Petroquimica
315004|Tecnico, Quimica Industrial
315005|Tecnico, Quimico Industrial/Caucho
315006|Tecnico, Quimica Industrial/Gas
315007|Tecnico, Quimica Industrial/Plasticos
315008|Tecnico, Quimica Industrial/Petroleo
315009|Tecnico, Quimica Industrial/Procesos Quimicos
315010|Tecnico, Quimica Industrial/Produccion Y Distribucion De Ga
315011|Tecnico, Quimica Industrial/Refinacion Del Petroleo
316001|Acidificador, Pozos De Petroleo Y Gas
316002|Técnico, Cementador, Pozos De Petroleo Y Gas
316003|Desincrustador, Pozos De Petroleo Y Gas
316004|Pegador, Pozos De Petroleo Y Gas
316005|Tecnico, Acidificacion/Pozos
316006|Tecnico, Extraccion/Carbon
316007|Tecnico, Extraccion/Gas (Sondeo De Pozos)
316008|Tecnico, Extraccion/Metales
316009|Tecnico, Extraccion/Petroleo Y Gas Natural
316010|Tecnico, Metalurgia/Ensayador De Metales
316011|Tecnico, Metalurgia/Extraccion
316012|Tecnico, Metalurgia/Siderurgica
316013|Tecnico, Metalurgia/Fundicion
316014|Tecnico, Metalurgia/Tratamiento Y/O Produccion De Metales
316015|Tecnico, Mineria
316016|Tecnico, Sondeo/Pozos De Petroleo Y Gas
317001|Delineante
317002|Delineante, Arquitectura
317003|Delineante, Cartografia
317004|Delineante, Geologia
317005|Delineante, Ilustraciones Tecnicas
317006|Delineante, Industrial
317007|Delineante, Ingenieria Aeronautica
317008|Delineante, Ingenieria Civil
317009|Delineante, Ingenieria De Edificios
317010|Delineante, Ingenieria De Sistemas De Calefaccion Y Ventila
317011|Delineante, Ingenieria Electrica
317012|Delineante, Ingenieria Electronica
317013|Delineante, Ingenieria Mecanica
317014|Delineante, Ingenieria Naval
317015|Delineante, Litografia
317016|Delineante, Matrices Y Herramientas
317017|Delineante, Tecnico
317018|Dibujante, Ilustraciones Tecnicas
317019|Dibujante, Proyectista/Artes Graficas
317020|Delineante, Dibujantes/Otros
317021|Supervisor De Artes Graficas
318001|Tecnico, Alimentos
318002|Tecnico, Calculo De Costos Y Cantidades
318003|Tecnico, Ceramica
318004|Tecnico, Cueros Y Pieles
318005|Tecnico, Eficiencia Industrial
318006|Tecnico, Estudio Del Trabajo
318007|Tecnico, Ingenieria/Estudio De Tiempos Y Movimientos
318008|Tecnico, Ingenieria/Metodos
318009|Tecnico, Ingenieria/Organizacion Industrial
318010|Tecnico, Ingenieria/Planificacion
318011|Tecnico, Ingenieria/Seguridad E Higiene Industrial
318012|Tecnico, Ingenieria/Produccion
318013|Tecnico, Papel
318014|Tecnico, Pesqueria
318015|Tecnico, Sistemas/Excepto Informaticos
318016|Tecnico En La Industria, Otros
319001|Tecnico En Estadistica
319002|Tecnico, En Matematica
319003|Tecnico En Estadistica O Matematica, Otros
319004|Programador, Codificador De Los Programas
319005|Programador, Desarrollo De La Logica Del Proceso
319006|Programador, Informatica/Por Computadora
319007|Programador, Informatica/Analisis De Base De Datos
319008|Programador, Informatica/Analisis De Sistemas
319009|Programador, Prueba Y Ejecucion Del Programa En Computadora
319010|Tecnico, Analisis Informatico
319011|Tecnico, Programacion Por Computadoras
319012|Tecnico, Servicios Informaticos Para Usuarios
321001|Operador, Equipos Informaticos/Computadoras
321002|Operador, Equipos Informaticos/Unidades Perifericas (Impres
321003|Operador, Almacenamiento De Datos
321004|Operador, Proceso De Aplicaciones Catalogadas
321005|Tecnico, Control De Equipos Informaticos
322001|Ayudante De Direccion, Cine
322002|Ayudante, Direccion Cinematografica
322003|Camarografo
322004|Camarografo, Cinematografo
322005|Camarografo, Television
322006|Cineasta
322007|Fotografo
322008|Fotografo Aereo
322009|Fotografo Comercial
322010|Fotografo Industrial
322011|Fotografo Medico
322012|Fotografo Publicitario
322013|Fotografo Retratista
322014|Fotografo, Arquitectura
322015|Fotografo, Ilustracion Comercial
322016|Fotografo, Microfotografia
322017|Fotografo, Modas
322018|Fotografo, Policia
322019|Fotografo, Prensa
322020|Montajista
322021|Operador, Camara De Cine
322022|Operador, Camara De Television
322023|Operador, Equipo Audio/Radio
322024|Operador, Equipo Audio/Television
322025|Operador, Equipo De Sonorizacion, Cine
322026|Operador, Equipo De Radio Y Television
322027|Operador, Grabacion De Sonido
322028|Operador, Grabacion De Sonido/Discos
322029|Operador, Grabacion De Sonido/Radio
322030|Operador, Grabacion De Sonido/Television
322031|Reportero Grafico/Fotografo Reportero
322032|Tecnico En Audio Visuales
322033|Tecnico, Efectos Sonoros/Cine
322034|Tecnico, Equipo De Sonorizacion/Radio
322035|Tecnico, Equipo De Sonorizacion/Television
322036|Tecnico, Equipo De Grabacion/Cinta Magnetica
322037|Tecnico, Equipo De Grabacion/Discos Digitales
322038|Tecnico, Equipo De Grabacion/Efectos Sonoros
322039|Tecnico, Equipo De Grabacion/Hilo Magnetico
322040|Tecnico, Equipo De Grabacion/Sonido
322041|Tecnico, Equipo De Grabacion/Video
322042|Tecnico, Equipo De Radio Y Television
322043|Tecnico, Material De Doblaje
322044|Tecnico, Pruebas De Sonido/Sonidista
323001|Luminotecnico, Television
323002|Operador, Cabina De Proyeccion/Cinematografia
323003|Operador, Equipo De Amplificacion De Sonido
323004|Operador, Equipo De Difusion/Telefilmes
323005|Operador, Equipo De Difusion/Television
323006|Operador, Equipo De Difusion/Video
323007|Operador, Equipo De Radiodifusion
323008|Operador, Equipo De Radiotelefonia/Estaciones Terrestres
323009|Operador, Equipo Moviles De Radiodifusion Y Television
323010|Operador, Estacion Emisora De Radio
323011|Operador, Estacion Emisora De Television
323012|Operador, Estudios De Radio
323013|Operador, Estudios De Television
323014|Operador, Microfonos
323015|Operador, Radar
323016|Operador, Radio/Navegacion Aerea
323017|Operador, Radio/Navegacion Maritima
323018|Operador, Telecomunicaciones
323019|Operador, Transmisores/Radio
323020|Operador, Transmisores/Television
323021|Operador-Jefe, Telecomunicaciones/Estacion
323022|Operador-Jefe, Telecomunicaciones/Trafico
323023|Radionavegante
323024|Radiotelegrafista
323025|Radiotelegrafista, Navegacion Maritima
323026|Tecnico Sala De Control/Radio
323027|Tecnico Sala De Control/Television
323028|Telegrafista
324001|Operador De Audiometria
324002|Operador De Electrocardiografia
324003|Operador De Electroencefolografia
324004|Operador De Scaner
324005|Operador De Scaner (Optica)
324006|Operador De Radiografia
324007|Operador De Rayos X
331001|Cuarto Oficial, Maquinista/Barco
331002|Inspector Tecnico, Marina/Mercante
331003|Instructor Navegacion/Vela
331004|Jefe De Maquinas, Barco
331005|Motorista, Lancha/Bolichera
331006|Oficial Maquinista, Barco
331007|Primer Oficial, Maquinista/Barco
331008|Segundo Oficial, Maquinista/Barco
331009|Superintendente Tecnico, Marina Mercante
331010|Tercer Oficial, Maquinista/Marina Mercante
332001|Alferez De Fragata, Reserva Naval/Marina Mercante
332002|Capitan, Altura
332003|Capitan, Barco/Navegacion Fluvial O Lacustre
332004|Capitan, Barco/Navegacion Maritima
332005|Capitan, Buque
332006|Capitan, Marina Mercante/Barco
332007|Capitan, Pesca
332008|Capitan, Puerto
332009|Capitan, Remolcador
332010|Capitan, Yate
332011|Comandante, Barco/Navegacion Maritima
332012|Comandante, Barco/Navegacion Interior (Lagos, Rios)
332013|Oficial, Cubierta
332014|Oficial, Navegacion
332015|Patron, Bolichera
332016|Patron, Barco/Navegacion Interior
332017|Patron, Barco/Navegacion Maritima
332018|Patron, Puerto
332019|Patron, Remolcador
332020|Patron, Yate
332021|Piloto, Aerodeslizador
332022|Piloto, Costero
332023|Piloto, Deslizador
332024|Piloto, Hidroplano
332025|Piloto-Practico Navegacion
332026|Practico, Puerto
332027|Superintendente, Armamento/Cubierta (Buques)
333001|Comandante, Aeronave
333002|Copiloto, Aeronave
333003|Instructor De Vuelo
333004|Oficial Mecanico, Vuelo/Mecanico Navegante
333005|Oficial Navegante, Aeronave
333006|Piloto, Aeronave/Transporte Aereo
333007|Piloto, Fumigacion
333008|Piloto, Helicoptero
333009|Piloto, Hidroavion
333010|Piloto, Instructor
333011|Piloto, Pruebas/Aeronautica
334001|Controlador, Trafico Aereo
334002|Tecnico, Seguridad/Trafico Aereo
335001|Especialista, Prevencion De Incendios
335002|Inspector, Incendios
335003|Inspector, Obras Y Edificios
335004|Investigador, Incendios
335005|Inspector, Control De Calidad
335006|Inspector, Control De Calidad/Electricidad
335007|Inspector, Control De Calidad/Equipos Electricos
335008|Inspector, Control De Calidad/Equipos Electronicos
335009|Inspector, Control De Calidad/Maquinas
335010|Inspector, Control De Calidad/Procesos Industriales
335011|Inspector, Control De Calidad/Productos Mecanicos
335012|Inspector, Control De Calidad/Servicios
335013|Inspector, Control De Calidad/Tejidos
335014|Inspector, Seguridad Y Salud
335015|Inspector, Seguridad Y Salud/Contaminacion Del Medio Ambien
335016|Inspector, Seguridad Y Salud/Cuidados A Los Niðos
335017|Inspector, Seguridad Y Salud/Electricidad
335018|Inspector, Seguridad Y Salud/Establecimientos
335019|Inspector, Seguridad Y Salud/Fabrica
335020|Inspector, Seguridad Y Salud/Proteccion De Los Consumidores
335021|Inspector, Seguridad Y Salud/Seguridad Industrial
335022|Inspector, Seguridad Y Salud/Tiendas Y Comercios
335023|Inspector, Seguridad Y Salud/Trabajo
335024|Inspector, Seguridad Y Salud/Tratamiento De Desechos Indust
335025|Inspector, Seguridad Y Salud/Vehiculos
335026|Inspector, Seguridad/Productos
335027|Inspector, Vehiculos/Especificaciones Tecnicas
335028|Revisor, Tejidos, Tecnicos
335029|Revisor/Telas
335030|Revisor-Inspector, Calidad
335031|Revisor-Probador, Maquina
335032|Tecnico, Prevencion De Incendios
341001|Disecador-Taxidermista
341002|Taxidermista (Naturalista-Preparador)
341003|Tecnico, Anatomia
341004|Tecnico, Bacteriologia
341005|Tecnico, Bancos De Sangre
341006|Tecnico, Biofisica
341007|Tecnico, Biologia (Analista)
341008|Tecnico, Bioquimica
341009|Tecnico, Botanica
341010|Tecnico, Ciencias Biologicas/Otros
341011|Tecnico, Citologia
341012|Tecnico, Ecologia
341013|Tecnico, Farmacologia
341014|Tecnico, Fisiologia
341015|Tecnico, Histologia
341016|Tecnico, Laboratorio Biologico
341017|Tecnico, Patologia
341018|Tecnico, Serologia
341019|Tecnico, Tejidos
341020|Tecnico, Zoologia En Ciencias Biologicas
342001|Animador Rural
342002|Demostrador, Practicas Agricolas
342003|Consejero, Agricola
342004|Consejero, Forestal
342005|Extensionista Agricola, Vulgarizador, Agricola
342006|Perito Agricola
342007|Tecnico Agronomo
342008|Tecnico Agronomo, Suelo
342009|Tecnico, Agropecuario
342010|Tecnico, Forestal
342011|Tecnico, Ganaderia (Pecuario)
342012|Tecnico, Horticultura
342013|Tecnico, Oleicultura
342014|Tecnico, Pomologia
342015|Tecnico, Silvicultura
342016|Tecnico, Zoologia En Agronomia, Zootecnia Y Silvicultura
343001|Asistente Medico
343002|Asistente Medico, Planificacion Familiar
343003|Auxiliar Medico
343004|Practicante En Medicina
343005|Sanitario
343006|Topiquero
344001|Higienista
344002|Inspector, Sanidad
345001|Tecnico Bromatologo
345002|Tecnico Consejero Dietetico, Industria De Alimentos
345003|Tecnico Dietista
345004|Tecnico Dietista, Dietetico Medica
345005|Tecnico Nutricionista, Salud Publica
346001|Contactologo
346002|Optico, Anteojos
346003|Optico, Oftalmologia
346004|Optometrista
347001|Asistente Dentista, Escuelas
347002|Auxiliar, Dentista
347003|Higienista, Bucodental
347004|Higienista, Profilaxia
347005|Practicante De Odontologia
348001|Baños Medicinales, Tratamiento
348002|Electroterapeuta
348003|Ergoterapeuta
348004|Fisioterapeuta (Terapeuta)
348005|Hidroterapeuta
348006|Kinesiterapeuta (Kinesiologos)
348007|Masajista
348008|Osteopata
348009|Podologo
348010|Quiropodista
348011|Quiropractico
348012|Tecnico, Gimnasia Medica
348013|Tecnico, Readaptacion Profesional
348014|Terapeuta, Readaptacion Fisica
348015|Terapeuta, Readaptacion Profesional
349001|Asistente, Veterinario
349002|Auxiliar Veterinario
349003|Tecnico Veterinario, Inseminacion Artificial
349004|Vacunador, Veterinario
349005|Vacunador, Veterinario/Aves De Granja
349006|Veterinario En Salud Publica, Tecnico
351001|Asistente, Farmaceutico
351002|Auxiliar Farmaceutico
351003|Practicante De Farmacia
351004|Practico En Farmacia
352001|Enfermera, Nivel Superior (Diplomados)
352002|Enfermera, Nivel Medio
352003|Enfermera, Nivel Medio/Clinica, Centro De Salud, Etc.
352004|Enfermera, Nivel Medio/Maternidad
352005|Enfermera, Nivel Medio/Obstetricia
352006|Enfermera, Nivel Medio/Ortopedia
352007|Enfermera, Nivel Medio/Pediatria
352008|Enfermero, Nivel Medio
352009|Enfermero, Nivel Medio/Clinica
352010|Enfermero, Nivel Medio/Obstetricia
352011|Enfermero, Nivel Medio/Ortopedia
352012|Enfermero, Nivel Medio/Pediatria
352013|Hermana, Enfermera/Nivel Medio
352014|Paramedicos
353001|Auxiliar De Partera
353002|Comadrona (Partera Practica)
353003|Matrona (Partera Practica)
353004|Partera Practica
354001|Curandero
354002|Curandero-Naturista, Aldea
354003|Curandero, Religioso
354004|Curandero, Sugestion
354005|Especialista En Ortoptia Y/O Ortofonia
354006|Herbolario
354007|Huesero
354008|Naturopata
355001|Tecnico Ortopedico
355002|Tecnologo Protesis
355003|Tecnico Radiologo
355004|Tecnologo Medico
356001|Tecnico En Laboratorio Clinico
356002|Tecnico De Salud
361001|Inspector Jefe, Comercio Al Por Mayor
361002|Supervisor De Ventas, Comercio Al Por Mayor
362001|Inspector Jefe, Comercio Al Por Menor
362002|Supervisor De Ventas, Comercio Al Por Menor
363001|Supervisor, Comercio N.E.P
364001|Administrador, Abastecimiento
364002|Administrador, Hogar/Economos
364003|Administrador, Material Contable
364004|Administrador, Personal
364005|Tecnicos Administradores, Otros
364006|Tecnicos En Racionalizacion Administrativa
365001|Tecnico, Comercio
365002|Tecnico, Cooperativismo
365003|Tecnico, Economia
365004|Tecnico, Mercadotecnia (Marketting)
365005|Tecnico, Planificacion
366001|Contador Mercantil
366002|Tecnico Contable En Costos
366003|Tecnico Contable Empresarial
366004|Tecnico Contable Gubernamental
366005|Tecnico En Teneduria De Libros
366006|Tecnicos Contables, Otros
367001|Tecnico En Ciencias Sociales
367002|Promotor Social (Tecnico Asimilado)
371001|Agente, Bolsa
371002|Agente, Cambio
371003|Asesor, Inversiones
371004|Corredor, Bolsa
371005|Corredor, Valores
372001|Agente, Seguros
372002|Asegurador
372003|Asegurador, Maritimo
372004|Corredor, Seguros
372005|Negociador, Seguros
372006|Vendedor De Polizas De Seguros
373001|Administrador, Propiedades Inmuebles
373002|Agente Inmobiliario
373003|Corredor, Fincas
373004|Vendedor, Bienes Raices
373005|Vendedor, Propiedades Inmuebles
374001|Agente Administrativo, Administracion Publica/Servicio De Turismo
374002|Agente Administrativo, Consulado/Servicio De Turismo
374003|Agente, Turismo
374004|Agente, Viajes
374005|Consejero, Turismo
374006|Organizador, Viajes
375001|Agente Distribuidor
375002|Agente, Ventas
375003|Agente, Ventas/Comercio
375004|Agente, Ventas/Industria Manufacturera
375005|Agente, Ventas/Tecnico
375006|Consejero, Servicio Postventa
375007|Corredor, Fabrica
375008|Inspector Tecnico, Ventas
375009|Representante,  Compaðia Nacional
375010|Representante, Fabrica/Concesionario
375011|Representante, Firmas Extranjeras
375012|Representante, Institucion Comercial
375013|Representante, Ventas/Comercio
375014|Representante, Ventas/Industria Manufacturera
375015|Representante, Ventas/Tecnico
375016|Vendedor, Comercio
375017|Vendedor, Industria Manufacturera
375018|Vendedor, Tecnico
375019|Viajante, Comercio/Agente
375020|Visitador Medico
376001|Agente, Compras/Suministros
376002|Agente, Suministros
376003|Comprador
376004|Comprador, Mercancias/Comercio Mayorista
376005|Comprador, Mercancias/Comercio Minorista
376006|Evaluador
376007|Inspector, Siniestros
376008|Liquidador, Reclamaciones/Seguros
376009|Martillero, Subastas Publicas
376010|Rematador
376011|Subastador
376012|Tasador
376013|Tasador, Seguros
376014|Tasador, Siniestros
376015|Verificador, Solicitudes De Indemnizacion
377001|Aduanero
377008|Agente, Servicios De Almacenamiento
377009|Correo Diplomatico
377010|Funcionario, Consulado
378001|Agente De Ventas, Servicio De Proteccion  Contra Robos E In
378002|Agentes De Ventas, Servicio De Iluminacion Y Limpieza
378003|Agente De Servicio De Aduana, No Empleado Publico
379001|Agente Transporte Y/O Mudanza
379002|Agente, Oficina De Colocacion
379003|Agente, Deportivo
379004|Agente, Literario
379005|Agente, Musical
379006|Agente, Publicidad
379007|Agente, Servicios A Las Empresas
379008|Agente, Teatro
379009|Agente, Venta De Publicidad/Espacios
379010|Contratista, Mano De Obra
379011|Empresario, Circo
379012|Empresario, Musica
379013|Empresario, Teatro
379014|Funcionario, Servicio Del Empleo
379015|Funcionario, Servicio Del Empleo/Jovenes
379016|Organizador De Espectaculo, Varios
379017|Promotor, Deportes
379018|Representante, Servicios A Las Empresas
379019|Representante, Servicios A Las Empresas/Espacios Publicitar
381001|Auxiliar, Abogacia
381002|Auxiliar, Actuario
381003|Auxiliar, Agente De Bolsa
381004|Auxiliar, Bufete/Abogado
381005|Auxiliar, Contador
381006|Auxiliar Estadistico (Empleado Estadistico)
381007|Auxiliar Matematico
381008|Ayudante, Contable
381009|Evaluador, Seguros/Primas
381010|Pasante, Abogado
381011|Pasante, Escribano
381012|Pasante, Notario
381013|Redactor, Polizas/Seguros
381014|Secretario, Juzgado, Tecnico
381015|Tenedor De Libros
382001|Empleado, Fisco
382002|Inspector, Hacienda
382003|Recaudador, Impuestos
383001|Funcionario, Prestaciones Sociales Y Otros
383002|Funcionario, Expedicion De Licencias Y Permisos
383003|Funcionario, Expedicion De Licencias/Exportacion
383004|Funcionario, Expedicion De Licencias/Importacion
383005|Funcionario, Expedicion De Pasaportes
383006|Funcionario, Inmigracion
383007|Funcionario, Permisos De Construccion
391001|Blasonistas
391002|Decorador De Ambiente
391003|Decorador Proyectista, Cine Y Teatro
391004|Decorador, Escaparates
391005|Decorador Exposiciones
391006|Decorador, Interiores
391007|Dibujante, Carteles
391008|Dibujante, Ilustraciones
391009|Dibujante, Interiores
391010|Dibujante, Moda
391011|Diseñador, Alfombras
391012|Diseñador, Decoracion De Interiores
391013|Diseñador, Decorador
391014|Diseñador, Decorador/Escenarios De Teatro
391015|Diseñador, Envases
391016|Diseñador, Escaparatista
391017|Diseñador, Exposiciones
391018|Diseñador, Grafico
391019|Diseñador, Heraldista
391020|Diseñador, Herreria Artistica
391021|Diseñador, Industrial
391022|Diseñador, Joyas
391023|Diseñador, Moda
391024|Diseñador, Muebles
391025|Diseñador, Orfebreria
391026|Diseñador, Piezas De Ceramica
391027|Diseñador, Prendas De Vestir
391028|Diseñador, Productos Comerciales
391029|Diseñador, Productos Industriales
391030|Diseñador, Telas Y Tejidos
391031|Escaparatista Decorador
391032|Heraldista
391033|Pintor, Tatuajes
392001|Anfitrion
392002|Comentarista-Entrevistador, Television - Radio
392003|Cronista, Noticiarios
392004|Locutor, Noticias
392005|Locutor, Radio
392006|Locutor, Television
392007|Presentador-Animador
392008|Presentador-Animador, Espectaculos Publicos
392009|Tecnico En Comunicacion
393001|Acrobata
393002|Amaestrador, Elefantes
393003|Amaestrador, Fieras
393004|Artista, Marionetas
393005|Artista, Strip-Tease
393006|Artista, Trapecio
393007|Caballista, Circo
393008|Comico
393009|Comico, Circo
393010|Contorsionista
393011|Domador, Circo
393012|Domador, Fieras
393013|Encantador, Serpientes
393014|Equilibrista
393015|Extras, Dobles
393016|Funambulo
393017|Hipnotizador
393018|Ilusionista
393019|Imitador
393020|Imitador, Ruidos De Animales
393021|Mago
393022|Malabarista
393023|Payaso
393024|Prestidigitador
393025|Titiritero
393026|Trapecista
393027|Vedette
393028|Ventrilocuo
393029|Volatinero
393030|Otros, Payasos, Acrobatas Y Afines
394001|Arbitro, Deportivo
394002|Atleta
394003|Automovilista, Carreras
394004|Banderillero
394005|Basketbolista
394006|Boxeador
394007|Catchascanista
394008|Corredor, Ciclista
394009|Deportista, Profesional
394010|Entrenador, Artes Marciales
394011|Entrenador, Atletismo
394012|Entrenador, Boxeo
394013|Entrenador, Golf
394014|Entrenador, Lucha
394015|Entrenador, Yoga
394016|Futbolista
394017|Jockey
394018|Juez, Boxeo
394019|Juez, Cancha
394020|Juez, Salida/Carreras
394021|Luchador
394022|Monitor, Cultura Fisico
394023|Picador, Toros
394024|Piloto, Carreras/Automoviles
394025|Profesor, Ajedrez
394026|Profesor, Billar
394027|Torero
394028|Voleibolista
394029|Otros, Atletas, Deportistas Y Afines
395001|Acolito
395002|Ayudante, Culto
395003|Diaconisa
395004|Diacono
395005|Evangelizador
395006|Fraile
395007|Miembro, Ejercito De Salvacion
395008|Monja, Nivel Medio
395009|Monje, Nivel Medio
395010|Predicador, Seglar
396001|Bailarin, Peðas, Salsodromos, Restaurantes Turisticos
396003|Director, Orquesta/Baile
396004|Musico, Peðas, Salsodromos, Restaurantes Turisticos
396005|Musico Ambulante
396007|Cantor Ambulante
411001|Jefe De Abastecimiento
411002|Jefe De Almacen
411003|Jefe De Archivo Y Correspondencia
411004|Jefe De Bienestar Social
411005|Jefe De Empleados De Oficina, Otros
411006|Jefe De Personal Administrativo
411008|Coordinador
411009|Encargado Del Servicio De Mantenimiento De Tramites, Etc.
412001|Empleado De  Registro Civil
412002|Empleado De Registro Electoral
413001|Mecanografa - Dactilografa
413002|Mecanografa, Estadisticas
413003|Mecanografa, Estenografia
413004|Mecanografa, Facturas
413005|Mecanografa, Maquina Perforadora
413006|Mecanografa, Taquigrafia
413007|Mecanografa, Textos
413008|Oficinista-Mecanografa
413009|Secretaria
413010|Secretaria, Bilingue
413011|Secretaria, Comercial
413012|Secretaria, Ejecutiva/Bilingue
413014|Secretaria, Medico
413015|Secretaria-Mecanografa
413016|Secretaria, Otros
413017|Secretaria-Taquigrafa
413018|Secretaria-Taquimecanografa
413019|Taquigrafa
413020|Taquimecanografa
413021|Mecanografica En Domicilio
414001|Operador De Maquina, Tratamiento De Texto
414002|Operador, Telefax
414003|Operador, Telegrafo
414004|Operador, Teleimpresora
414005|Teletipista, Telex
415001|Digitador
415002|Controlador, Perforaciones
415003|Operador, Entrada De Datos/Clasificadora
415004|Operador, Entrada De Datos/Computadoras
415005|Operador, Entrada De Datos/Convertidor (De Cintas A Tarjeta
415006|Operador, Entrada De Datos/Maquina Convertidora (De Cintas
415007|Operador, Entrada De Datos/Maquina Convertidora (De Tarjeta
415008|Operador, Entrada De Datos/Maquina Perforadoras (Cintas)
415009|Operador, Entrada De Datos/Maquina Perforadoras (Tarjetas Y
415010|Operador, Entrada De Datos/Maquina Perforadoras (Teclado)
415011|Operador, Entrada De Datos/Tabuladora
415012|Operador, Entrada De Datos/Transcripcion De Perforaciones (
415013|Verificador Del Operador De Maquina Perforadora De Tarjetas
415014|Tipeo Por Computadora
416001|Calculista A Maquina
416002|Operador, Calculadora
416003|Operador, Computadora
416004|Operador, Maquina De Contabilidad
416005|Operador, Maquina De Preparar Facturas
416006|Operador, Maquina Franqueadora
416007|Operador, Maquina Contable
416008|Operador, Maquina De Llevar Libros
416009|Operador, Maquina De Sumar
417001|Operador, Maquina Clasificadora Y Tabulados
417002|Operador,  Ordenador Electronico
417003|Otros Operadores De Maquinas Para El Tratamiento Automatico
418001|Empleados De Contabilidad Y Calculo De Costos
418002|Empleado, Caja
418003|Empleado, Calculo De Costos
418004|Empleado, Calculo De Presupuestos
418005|Empleado, Calculo De Salarios
418006|Empleado, Contabilidad
418007|Empleado, Contabilidad/Calculo De Costos
418008|Empleado, Contabilidad/Calculo De Intereses
418009|Empleado, Contabilidad/Cuentas Corrientes
418010|Empleado, Contabilidad/Descuentos
418011|Empleado, Contabilidad/Estimaciones
418012|Empleado, Contabilidad/Verificacion
418013|Empleado, Facturas
418014|Empleado, Pagador De Planillas De Pago
418015|Empleado, Planillero
418016|Empleado, Pago De Nominas
418017|Empleado, Pago De Salarios
418018|Empleado, Servicio Del Personal
418019|Empleado, Subastas
418020|Empleado, Teneduria De Libros
418021|Listero
419001|Amanuense, Estadistica
419002|Critico-Codificador
419003|Empleado Actuarial
419004|Empleado, Bancos
419005|Empleado, Banco/Prestamos
419006|Empleado, Bolsa
419007|Empleado, Creditos
419008|Empleado, Estadistica
419009|Empleado, Finanzas
419010|Empleado, Hipotecas
419011|Empleado, Inversiones
419012|Empleado, Oficina De Impuestos/Sellos Y Timbres
419013|Empleado, Registro De Titulos Y Acciones
419014|Empleado, Servicios Financieros
419015|Empleado, Seguros
419016|Empleado, Seguros/Modificaciones De Cobertura
419017|Empleado, Seguros/Pago De Suministros
419018|Empleado, Seguros/Polizas
419019|Empleado, Servicios Juridicos
419020|Empleado, Transacciones
419021|Empleado, Valores
421001|Almacenero
421002|Empleado, Abastecimiento
421003|Empleado, Almacenaje Y Aprovisionamiento
421004|Empleado, Contabilidad/Existencias
421005|Empleado, Control De Peso
421006|Empleado, Deposito
421007|Empleado, Despacho
421008|Empleado, Embarque/Mercaderia
421009|Empleado, Existencias/Registrador
421010|Empleado, Existencias/Control
421011|Empleado, Existencias/Control (Registros)
421012|Empleado, Existencias/Inventario
421013|Empleado, Existencias/Mercaderia
421014|Empleado, Expedicion Y Recepcion De Mercaderia
421015|Empleado, Guardamuebles
421016|Empleado, Herramientas/Almacen
421017|Empleado, Interventor Almacenista
421018|Empleado, Mercaderias
421019|Empleado, Movimiento/Mercaderias
421020|Empleado, Recepcion/Mercaderia (Almacen)
421021|Empleado, Registrador/Entradas Y Salidas De Mercaderias
421022|Empleado, Servicio De Almacenaje
421023|Empleado, Suministros
421024|Empleado, Kardista/Tarjador
422001|Empleado, Abastecimiento/Materiales
422002|Empleado, Calculo De Materiales
422003|Empleado, Planificacion De La Produccion
422004|Empleado, Planificacion De La Produccion/Coordinacion
422005|Empleado, Planificacion De La Produccion/Programa
422006|Empleado, Planificacion/Materiales
422007|Empleado, Programa De Abastecimiento/Materiales
423001|Empleado De Agencia De Seguros
423002|Empleado De Correspondencia
423003|Empleado De Oficina En General
423004|Empleado De Oficina Publica O Particular
423005|Empleado De Servicios Administrativos, Otros
423006|Empleado De Servicios De Personal
423007|Escribiente De Abogado
423008|Escribiente De Notario
423009|Escribiente De Procurador
423010|Escribiente Publico
423011|Recopilador De Directorios Y Guias
423012|Secretario De Juzgado, Empleado De Oficina
423013|Tramitadores (Redactan Cartas, Llenador Formularios, Etc)
423014|Controlador De Tarjetas De Personal
423015|Tramitador De Oficina
431001|Jefe De Estacion De Ferrocarril
432001|Agente De Los Servicios De Mercancias, Ferrocarriles
432002|Agente De Los Servicios De Transporte De Carga, Ferrocarril
432003|Jefe De Movimiento De Trenes
432004|Jefe De Trafico, Ferrocarriles
433001|Jefe De Servicios De Transporte Por Carretera
434001|Jefe De Escala De Transporte Aereo
434002|Jefe De Operaciones De Vuelo Transporte Aereo
435001|Jefe De Tren De Pasajeros
435002|Controladores De Coche-Cama
435003|Controlador De Vagones De Lujo Y Pullman
435004|Otros Jefes De Tren, Cobradores.
436001|Agente, Ferrocarril/Mercancias
436002|Controlador Administrativo, Ferrocarril/Mercancias
436003|Controlador Administrativo, Trafico Aereo
436004|Controlador Administrativo, Transporte Aereo
436005|Controlador Administrativo, Transporte Ferroviario (Cargas)
436006|Controlador Administrativo, Transporte Maritimo
436007|Controlador Administrativo, Transporte Por Carretera
436008|Empleado, Despacho/Autobuses
436009|Empleado, Despacho/Barcos
436010|Empleado, Despacho/Camiones
436011|Empleado, Despacho/Ferrocarril
436012|Empleado, Despacho/Gasoducto
436013|Empleado, Despacho/Muelles
436014|Empleado, Despacho/Oleoducto
436015|Empleado, Despacho/Transporte Aereo
436016|Empleado, Despacho/Transporte Carga
436017|Empleado, Despacho/Transporte Fluvial Y Transbordador
436018|Empleado, Despacho/Transporte Maritimo
436019|Empleado, Despacho/Transporte Por Carretera (Excepto Autobu
436020|Empleado, Ferrocarril/Deposito
436021|Empleado, Movimientos/Trenes
436022|Empleado, Operaciones/Transporte Aereo
436023|Empleado, Transporte
436024|Empleado, Transporte Aereo/Expedicion
436025|Empleado, Transporte Aereo/Movimiento
436026|Empleado, Transporte Maritimo/Estacion Terminal
436027|Empleado, Transporte Maritimo/Muelle
436028|Empleado, Transporte Por Carretera/Trafico
436029|Encargado, Servicios/Ferrocarril (Deposito)
436030|Encargado, Servicios/Muelle
436031|Encargado, Servicios/Transbordador
436032|Encargado, Servicios/Transporte Por Carretera (Trafico)
436033|Inspector, Servicios/Barcaza
436034|Inspector, Servicios/Carga
436035|Inspector, Servicios/Transporte Por Carretera
436036|Inspector, Servicios/Transporte Por Ferrocarril
441001|Jefe De Oficina De Correo
441002|Jefe De Servicios De Correo
441003|Jefe De Servicios De Postales
441004|Jefe De Servicios De Telecomunicaciones
442001|Archivero, De Museo
442002|Asistente, Biblioteca
442003|Ayudante De Biblioteca
442004|Empleado, Archivo/Servicios
442005|Empleado, Biblioteca
442006|Empleado, Biblioteca/Adquisiciones
442007|Empleado, Biblioteca/Clasificacion
442008|Empleado, Biblioteca/Indice
442009|Empleado, Biblioteca/Prestamo De Libros
443001|Cartero
443002|Clasificador, Correspondencia
443003|Empleado De Correos, Correspondencia/Clasificacion
443004|Empleado, Distribucion/Correspondencia
443005|Encargado, Entrega De Encomiendas A Domicilio
443006|Encomendero, Reparto De Encomiendas
443007|Estafetero, Recibidor De Cargas/Correo
443008|Mandadero, Oficina/Conserje De Oficina
443009|Mensajero, Correspondencia
443010|Portapliego De Oficina
443011|Supervisor, Correo
444001|Corrector, Pruebas De Imprenta
444002|Empleado, Correccion De Pruebas/Imprenta
444003|Empleado, Elaboracion De Listas
444004|Empleado, Escrituras
444005|Empleado, Clasificador De Documentos
444006|Empleado, Maquina Franqueadora
451001|Cajero, Almacen/Autoservicio
451002|Cajero, Apuestas
451003|Cajero, Banco
451004|Cajero, Cobrador De Peajes
451005|Cajero, Contabilidad De Caja
451006|Cajero, Empresa/Almacen
451007|Cajero, Hotel
451008|Cajero, Mostrador
451009|Cajero, Oficina
451010|Cajero, Restaurante
451011|Cajero, Tienda
451012|Cajero, Venta De Billetes
451013|Cambista, Compra-Venta  De Dolares
451014|Empleado, Emision De Billetes/Excepto De Viaje
451015|Empleado, Operaciones De Cambio
451016|Empleado, Ventanilla De Banco
451017|Empleado, Ventanilla De Correos
451018|Expendedor De Giros Postales
451019|Taquillero
451020|Tesorero
451021|Vendedor De Estampillas
452001|Prestamista, Dinero
452002|Prestamista, Prendario
453001|Cobrador A Domicilio, Ventas A Plazos
453002|Cobrador, Alquileres
453003|Cobrador Contribuciones
453004|Cobrador, Deudas
453005|Cobrador Espectaculos
453006|Cobrador, Facturas
453007|Cobrador, Impuestos
453008|Cobrador, Peaje
453009|Cobrador, Seguros
454001|Empleado, Agencia De Viajes
454002|Empleado, Agencia De Viajes/Ventas De Billetes
454003|Empleado, Emision De Billetes/Viajes
454004|Empleado, Viajes
454005|Empleado, Viajes/Ferrocarriles
454006|Empleado, Viajes/Lineas Aereas
454007|Empleado, Concertacion De Entrevistas
454008|Empleado, Informes
454009|Recepcionista
454010|Recepcionista, Dentista
454011|Recepcionista, Hospital/Consultorio Medico
454012|Recepcionista, Hotel
454013|Recepcionista, Medico
455001|Operadora, Central Telefonica
455002|Radio-Telefonista, Estaciones Terrestres
455003|Telefonista, Publica O Privada
456001|Crupier, Sala De Juego
456002|Recibidor De Apuestas
461001|Encuestadores
461002|Empadronadores
461003|Recopilador De Informacion Estadistica
461004|Registradores
461005|Supervisor De Campo
462001|Auxiliar De Oficina
462002|Empleado, Operador De Maquina Autocopista
462003|Empleado, Operador De Fotocopiadora
462004|Empleado, Operador De Maquina Reproductora De Documentos
462005|Empleado, Operador De Maquina Multicopista
462006|Empleado De Oficina, Otros
462007|Segmentista
511001|Ayudante, Vuelo
511002|Aeromoza, Camarera De Avion
511003|Azafata, Aeropuerto
511004|Azafata, Avion
511005|Azafata, Informacion/Aeropuerto
511006|Camarero, Barco
511007|Fly Hostess, Aeromoza
511008|Pursers
511009|Tripulante, Cabina/Pasajeros
512001|Guia, Excursiones
512002|Guia, Expedicion De Caza
512003|Guia, Galeria De Arte
512004|Guia, Museos
512005|Guia, Turismo
512006|Guia, Viajes/Andinismo
512007|Guia, Viajes/Autobus
512008|Guia, Viajes/Establecimientos Industriales
512009|Guia, Viajes/Galeria De Arte
512010|Guia, Viajes/Local
512011|Guia, Viajes/Montaðismo
512012|Guia, Viajes/Museos
512013|Guia, Viajes/Parques Naturales Y Reservas Nacionales
512014|Guia, Viajes/Pesca
512015|Guia, Viajes/Reserva De Caza
512016|Guia, Viajes/Safari
512017|Guia, Viajes/Teatro Y Monumentos
521001|Economo, Hosteleria
521002|Jefe De Personal De Servidumbre, Barco
521003|Jefe De Camareros
521004|Maitre
521005|Maestresala
521006|Mayordomo, Excepto Hogar Particular
522001|Cocinero, Barco
522002|Cocinero, Chef
522003|Cocinero, Conservacion De Alimentos
522004|Cocinero, Dietas Especiales
522005|Cocinero, Vegetales
523001|Azafata, Servicio De Comidas/Personal
523002|Barman
523003|Mozo
531001|Auxiliar, Enfermeria
531002|Auxiliar, Enfermeria/Primeros Auxilios
531003|Auxiliar, Hospitalario
531004|Ayudante, Ambulancia
531005|Ayudante, Enfermeria
531006|Ayudante, Enfermeria/Ambulancia
531007|Ayudante, Enfermeria/Clinica
531008|Ayudante, Enfermeria/Hospital
531009|Camillero
531010|Enfermero, Ambulancia
531011|Ayudante, Enfermeria/Domicilio
531012|Ayudante, Consultorio Dental
541001|Callista
541002|Capilicultor
541003|Cosmetologo
541004|Especialista, Tratamientos De Belleza
541005|Estilista
541006|Manicurista
541007|Maquillador, Cine
541008|Maquillador, Salon
541009|Maquillador, Teatro
541010|Masajista Estetico
541011|Pedicurista
541012|Peinadora
541013|Peluquero, Caballeros
541014|Peluquero, Seðoras
541015|Peluquero-Barbero
551001|Amortajador
551002|Embalsamador
551003|Empleado, Pompas Funebres/Agencia Funeraria
551004|Empresario, Pompas Funebres
551005|Organizador De Pompas Funebres
551006|Tramitador De Documentos Para Sepelio
552001|Maniqui
552002|Modelo De Fotografia
552003|Modelo, Artista
552004|Modelo, Escultores
552005|Modelo, Modas
552006|Modelo, Pintores
552007|Modelo, Publicidad
553001|Astrologo
553002|Cartomantico
553003|Geomantico
553004|Numerologo
553005|Numeromantico
553006|Oniromantico
553007|Quiromantico
561001|Bombero
561002|Bombero, Accidentes De Aviacion
561003|Bombero, Aeropuertos
561004|Bombero, Forestal
561006|Especialista, Salvamento/Incendios (Desastres)
562001|Alguaciles
562002|Policia Municipal
562003|Serenazgo
563001|Carcelero
563002|Guardian, Carcel
563003|Guardian, Prision, Establecimiento Penal
563004|Vigilante De Establecimiento Penal Y Otros Centros Tutelare
564001|Custodio
564002|Guardaespalda
564003|Guardia De Seguridad (Privados)
564004|Policia Particular
564005|Vigilante De Seguridad (Privados)
565001|Detective Privado
571001|Comerciante, Comercio Al Por Mayor
571002|Despachador, Mercaderias/Comercio Al Por Mayor
571003|Mayorista, Comercio Al Por Mayor
571004|Vendedor, Abarrotes/Comercio Al Por Mayor
571005|Vendedor, Proveedor/Comercio Al Por Mayor
571006|Vendedor, Comercio Al Por Mayor
572001|Comerciante, Articulos Deportivos
572002|Comerciante, Articulos Electrodomesticos
572003|Comerciante, Boutique
572004|Comerciante, Calzado
572005|Comerciante, Carros
572006|Comerciante, Combustible/Grifero (Despachador De Gasolina)
572007|Comerciante, Joyeria Y Relojeria
572008|Comerciante, Juguetes
572009|Comerciante, Licores
572010|Comerciante, Loza Y Porcelana
572011|Comerciante, Muebles
572012|Comerciante, Optica
572013|Comerciante, Prendas De Vestir
572014|Comerciante, Repuestos En General
572015|Despachador, Mercaderia/Comercio Al Por Menor
572016|Vendedor, Abarrotes/Abacero (Bodeguero)
572017|Vendedor, Artesania
572018|Vendedor, Carbon
572019|Vendedor, Carne
572020|Vendedor, Carton/Papel
572021|Vendedor, Farmacia
572022|Vendedor, Cigarrillos
572023|Vendedor, Ferreteria
572024|Vendedor, Flores
572025|Vendedor, Frutas
572026|Vendedor, Herbolarios/Hierbas
572027|Vendedor, Leche
572028|Vendedor, Licoreria
572029|Vendedor, Libros/Utiles Escolares
572030|Vendedor, Loza/Cristaleria Y Porcelana
572031|Vendedor, Maderas/Triplay
572032|Vendedor, Materiales De Construccion
572033|Vendedor, Muebleria
572034|Vendedor, Pasamaneria/Merceria
572035|Vendedor, Perfumeria
572036|Vendedor, Peletero
572037|Vendedor, Prendas De Vestir
572038|Vendedor, Pulpa
572039|Vendedor, Repuestos En General
572040|Vendedor, Sombreros
572041|Vendedor, Zapateria
572042|Otros, Comerciantes Vendedores Al Por Menor (No Ambulatorio
573001|Demostrador (A) De Articulos
573002|Demostrador (A) De Productos Para La Venta En Establecimien
574001|Vendedor En Puesto De Mercado
574002|Vendedor En Kiosco
575001|Empleado, Dependiente De Tienda, Comercio Nep
575002|Vendedor, Comercio Nep
581001|Vendedores De Artefactos Electricos
581002|Vendedores De Libros
582001|Comprador Vendedor De Oro, Plata
582002|Compra Venta De Monedas Y Billetes
583001|Comercio N.E.
611001|Capataz Forestal
611002|Capataz De Campo De Hacienda
611003|Caporal, Mayordomo De Hacienda
611004|Jefe De Maquinaria Agricola
612001|Agricultor
612002|Agricultor Explotador, Cultivo/Alfalfa
612003|Agricultor Explotador, Cultivo/Algodon
612004|Agricultor Explotador, Cultivo/Arroz
612005|Agricultor Explotador, Cultivo/Cacahuete
612006|Agricultor Explotador, Cultivo/Caða De Azucar
612007|Agricultor Explotador, Cultivo/Cereales
612008|Agricultor Explotador, Cultivo/Flores
612009|Agricultor Explotador, Cultivo/Grano
612010|Agricultor Explotador, Cultivo/Hortalizas (Cultivo Extensiv
612011|Agricultor Explotador, Cultivo/Lino
612012|Agricultor Explotador, Cultivo/Maiz
612013|Agricultor Explotador, Cultivo/Remolacha
612014|Agricultor Explotador, Cultivo/Sisal
612015|Agricultor Explotador, Cultivo/Soja
612016|Agricultor Explotador, Cultivo/Tabaco
612017|Agricultor Explotador, Cultivo/Trigo
612018|Agricultor Explotador, Cultivo/Yute
612019|Productor, Cultivos Extensivos
612020|Productor, Hortalizas/Cultivo Extensivo
612021|Productor, Remolacha Azucarera
612022|Productor, Soya
612023|Trabajador Agricola Calificado, Algodon
612024|Trabajador Agricola Calificado, Arroz
612025|Trabajador Agricola Calificado, Cacahuetes
612026|Trabajador Agricola Calificado, Caða De Azucar
612027|Trabajador Agricola Calificado, Cultivo Extensivo
612028|Trabajador Agricola Calificado, Hortalizas
612029|Trabajador Agricola Calificado, Irrigacion
612030|Trabajador Agricola Calificado, Lino
612031|Trabajador Agricola Calificado, Patatas
612032|Trabajador Agricola Calificado, Remolacha
612033|Trabajador Agricola Calificado, Tabaco
612034|Trabajador Agricola Calificado, Trigo
612035|Trabajador Agricola Calificado, Yute
613001|Agricultor Explotador, Almendras
613002|Agricultor Explotador, Cultivo/Citricos
613003|Agricultor Explotador, Plantacion/Cacao
613004|Agricultor Explotador, Plantacion/Cafe,Te
613005|Agricultor Explotador, Plantacion/Cocoteros
613006|Agricultor Explotador, Plantacion/Hevea
613007|Agricultor Explotador De Via
613008|Arboricultor, Almendros
613009|Arboricultor, Arbustos
613010|Arboricultor, Cacao
613011|Arboricultor, Cafetales
613012|Arboricultor, Cocoteros
613013|Arboricultor, Frutales En General
613014|Arboricultor, Lupulo
613015|Arboricultor, Nogales
613016|Arboricultor, Oleaginosas
613017|Arboricultor, Plantaciones/Copra
613018|Arboricultor, Plantaciones/Hevea
613019|Arboricultor, Plantaciones/Te
613020|Cultivador, Lupulo
613021|Cultivador, Plantaciones/Te
613022|Cultivador Explotador, Caucho
613023|Fruticultor
613024|Injertador
613025|Podador, Arboles Frutales
613026|Podador-Injertador, Arbustos
613027|Resinero
613028|Sangrador, Arboles/Excepto Hevea
613029|Sangrador, Caucho
613030|Sangrador, Jarabe De Arce
613031|Shivingero
613032|Trabajador Agricola Calificado, Arboles Frutales
613033|Trabajador Agricola Calificado, Arbustos
613034|Trabajador Agricola Calificado, Cacao
613035|Trabajador Agricola Calificado, Cafe
613036|Trabajador Agricola Calificado, Cosecha/Arbustos
613037|Trabajador Agricola Calificado, Hevea
613038|Trabajador Agricola Calificado, Huertos
613039|Trabajador Agricola Calificado, Lupulo
613040|Trabajador Agricola Calificado, Plantaciones/Arbustos
613041|Trabajador Agricola Calificado, Plantaciones/Te
613042|Trabajador Agricola Calificado, Viticultura
613043|Vinicultor
613044|Viticultor
614001|Cultivador, Hongos
614002|Cultivador, Setas Y Champiðones
614003|Cultivador, Viveros
614004|Cultivador, Viveros/Bulbos
614005|Cultivador, Viveros/Especias
614006|Cultivador, Viveros/Hortalizas
614007|Cultivador, Viveros/Semillas
614008|Floricultor
614009|Floricultor, Rosas
614010|Floricultor, Tulipanes
614011|Hortelano
614012|Horticultor
614013|Horticultor, Viveros
614014|Jardinero, Semillero
614015|Jardinero, Viveros
614016|Trabajador Agricola Calificado, Cesped
614017|Trabajador Agricola Calificado, Cultivo De Hongos
614018|Trabajador Agricola Calificado, Horticultura
614019|Trabajador Agricola Calificado, Vivero
615001|Agricultor (Explotador), Policultivos
615002|Agricultor Forestal, Trabajador Independiente
615003|Agricultor Ganadero, Trabajador Independiente
615004|Explotador Agricola, Trabajador Independiente
615005|Explotador Agropecuario, Trabajador Independiente
615006|Campesino, Trabajador Independiente
615007|Ganadero Forestal, Trabajador Independiente
615008|Trabajador Agricola Calificado, Policultivos
616001|Explotador, Forestal O Bosques
616002|Almadiero
616003|Aserrador, Monte
616004|Clasificador, Troncos
616005|Cortador De Traviesas De Ferrocarril Y/O Postes
616006|Cubicador, Madera
616007|Descorchador, Alcornoques
616008|Descortezador, Arboles
616009|Escalador-Podador, Arboles
616010|Escuadrador, Troncos
616011|Supervisor, Forestal
616012|Flotador, Troncos
616013|Gabarrero
616014|Ganchero Forestal
616015|Guardabosques
616016|Marcador, Arboles
616017|Plantador, Arboles/Silvicultura
616018|Podador, Silvicultura
616019|Secador, Corcho
616020|Talador En General (Cortador De Arboles)
616021|Trabajador Forestal Calificado
616022|Trabajador Forestal Calificado, Repoblacion Forestal
616023|Trabajador Forestal Calificado, Silvicultura
616024|Trozador, Arboles
616025|Trozador, Traviesas De Ferrocarril
616026|Trozador, Vigas
617001|Carbonero, Carbon Vegetal
617002|Destilador, Madera
617003|Trabajador Carbonero Calificado, Carbon Vegetal/Tecnicas Tr
617004|Trabajador Forestal Calificado, Destilacion De Madera/Tecni
621001|Criador, Auquenidos
621002|Criador, Caballos
621003|Criador, Conejos
621004|Criador, Corderos De Astracan
621005|Criador, Cuyes
621006|Criador, Ganado Vacuno (Excepto Ganado Lechero)
621007|Criador, Ganado Bovino
621008|Criador, Ganado Caballar
621009|Criador, Ganado Caprino/Cabras (Lana)
621010|Criador, Ganado Ovino (Lana)
621011|Criador, Ganado Porcino
621012|Criador, Reproductores
621013|Esquilador
621014|Jefe De Cuadra
621015|Ganadero
621016|Ganadero, Auquenidos
621017|Ganadero, Cunicultor/Conejo
621018|Ganadero, Cuyes
621019|Ganadero, Toro De Lidia
621020|Ganadero Vacuno (Execpto Ganado Lechero)
621021|Ganadero Caballo
621022|Ganadero Lanal
621023|Ganadero Porcino
621024|Inseminador, Ganado
621025|Ordeñador
621026|Trabajador Pecuario Calificado
621027|Trabajador Pecuario Calificado, Criadero De Animales
621028|Trabajador Pecuario Calificado, Ganaderia
621029|Trabajador Pecuario Calificado, Ganado Vacuno
621030|Trabajador Pecuario Calificado, Ganado Lanar
621031|Trabajador Pecuario Calificado, Ganado Porcino
622001|Criador De Vacas Lecheras
622002|Criador De Cabras Para La Produccion De Leche
623001|Avicultor
623002|Avicultor, Cria/Criadero
623003|Avicultor, Huevos
623004|Avicultor, Incubacion Artificial
623005|Avicultor, Ocas
623006|Avicultor, Patos
623007|Avicultor, Pavos
623008|Avicultor, Pollos
623009|Clasificador, Pollos
623010|Criador, Aves De Caza
623011|Criador, Aves De Corral
623012|Granjero, Avicultor
623013|Inseminador, Aves
623014|Sexador, Pollos
623015|Trabajador Calificado, Avicultura
623016|Trabajador Calificado, Incubadoras
624001|Apicultor (Criador De Abejas)
624002|Criador, Gusano De Seda
624003|Sericicultor
624004|Trabajador Calificado, Apicultura
624005|Trabajador Calificado, Sericicultura
625001|Adiestrador, Perros
625002|Criador, Animales De Laboratorio/Cobayos
625003|Criador, Animales No Domesticos/Pieles Finas
625004|Criador, Animales Salvajes/Pieles Finas
625005|Criador, Animales/Reservas Naturales
625006|Cuidador, Animales/Parques Zoologicos
625007|Cuidador, Animales/Reservas Naturales
625008|Criador De Gatos
625009|Criador De Perros
625010|Entrenador, Caballos De Carrera
625011|Guardian, Ganado
625012|Guardian, Pajarera
625013|Guardian, Parque Zoologico
625014|Trabajador Calificado, Aves Y Pajaros Salvajes
625015|Trabajador, Animales Salvajes/Pieles Finas
625016|Trabajador, Cria De Pajaros Salvajes
625017|Trabajador, Zoologico
631001|Encargado De Acuario
631002|Piscicultor Criadores De Especies Acuaticas
631003|Pisicultor De Truchas
631004|Trabajador De Piscigranjas
631005|Langostero
631006|Ostricultor
631007|Mariscador/Marisquero
631008|Mejillonero
631009|Ostrero
631010|Larvero
632001|Buzo, Pescador/Esponjas
632002|Buzo, Pescador/Ostras
632003|Pescador De Rio
632004|Pescador De Lago
632005|Pescador, Agua Dulce
632006|Pescador, Costero
632007|Pescador, Esponjas
632008|Pescador, Mariscador
632009|Pescador, Mejillonero
632010|Pescador, Ostras Perliferas
633001|Almadrabero
633002|Anchovetero
633003|Pescador De Altura
633004|Pescador De Bajura
633005|Pescador De Bolichera
633006|Pescador, Rastra
633007|Pescador, Atunero
633008|Redero De Mar
633009|Tripulacion De Barcos Pesqueros, Otros
634001|Arponero
634002|Ballenero
634003|Cazador, Ballenas
634004|Descuartizador, Ballenas
635001|Camaronero
635002|Recolector De Algas, Esponjas O Musgo Marino
635003|Caracolero
635004|Cazadores De Tortugas Marinas
635005|Conchero
635006|Cazadores De Otros Animales Acuaticos (Focas, Lobos Marinos
635007|Chorero
635008|Criador De Ostras
636001|Cazador De Animales Salvajes
636002|Cazador De Venado, Chinchilla
636003|Cazador De Aves
636004|Cazador De Monos
636005|Cazador De Animales De Pieles
636006|Cazador De Serpientes
636007|Cazador, Otros
637008|Tramperos
641001|Agricultor, Subsistencia
641002|Trabajador Agricola Calificado, Cultivos De Subsistencia
641003|Pescador, Subsistencia
641004|Trabajador, Pescador Calificado, Pesca De Subsistencia
711001|Adornistas
711002|Apiri
711003|Apuntalador, Ademador, Aladero, Entibador, Minas
711004|Artillero, Minas Y Canteras
711005|Apurador-Lavador De Mineral
711006|Aserrador De Piedra
711007|Barrenero, Dinamitero
711008|Capataz O Contramaestre De Minas Y Canteras
711009|Clasificador De Piedra
711010|Colector De Muestras,Minas
711011|Conductor De Maquina Rozadora, Cortadora, Perforadora,Etc
711012|Conductor De Maquina Continua De Arranque
711013|Cribador De Carbon O Minerales
711014|Desmuestrador O Colector De Muestras
711015|Dinamitero, Pegador, Minas Y Canteras
711016|Dolador, Piedras
711017|Enganchador, Minas
711018|Escogedor De Minerales
711019|Escogedor De Piedras
711020|Estribador De Minerales
711021|Entibador, Enmaderador De Mina O De Galeria
711022|Grabador De Inscripciones Y Piedra A Mano
711023|Grabador Motivos Simples En Bloques De Piedras
711024|Grabador De Piedra Con Estarcidores
711025|Grabador De Relieve En Piedra A Mano
711026|Hendedor De Piedras
711027|Lavador De Oro
711028|Lavador De Minerales
711029|Machacador, Triturador, Minerales
711030|Maniobrista, Minas
711031|Molinero De Mineral
711032|Operador De Aparato De Precipitacion
711033|Operador De Cono De Separacion, Minas
711034|Operador De Cribas Hidraulicas
711035|Operador De Instalaciones De Flotacion
711036|Operador De Prensa De Pellets De Mineral
711037|Operador De Quebrantadora De Mineral
711038|Operador De Quebrantadora De Rocas
711039|Operador De Trituradora De Minerales
711040|Palero, Minas
711041|Pegador, Minas Y Canteras
711042|Perforadores De Minas
711043|Perforador De Piedras
711044|Prensador De Briquetas De Carbon
711045|Pulidor De Piedra A Mano
711046|Pulidor De Piedra A Maquina
711047|Sacamuestras, Minas
711048|Tallador De Laminas
711049|Tallador De Piedra
711050|Terraplenista,Minas
711051|Terrerista, Minas
711052|Tolvero,Minas Y Canteras
711053|Tomador De Muestras,Minas
711054|Tornero, Labra  De Piedra
711055|Trazador Sobre Piedra
711056|Trecheador De Minas Y Canteras
711057|Triturador, Minerales
711058|Tronzador De Piedras
712001|Cementador, Pozos De Petroleo Y Gas
712002|Conductores De Perforadora De Percusion, Pozos De Petroleo
712003|Conductores De Tren De Sondeo Por Rotacion, Pozos De Petrol
712004|Desincrustador De Pozos De Petroleo Y Gas
712005|Mecanico De Sondas, Pozos De Petroleo Y Gas
712006|Operador De Acidificacion De Pozos De Petroleo
712007|Otros Sondistas Y Trabajadores Asimilados
712008|Peon De Torre, Petroleo
712009|Perforador Con Aparato Rotativo, Pozos De Petroleo Y Gas
712010|Perforador De Pozos De Agua
712011|Perforador De Pozos Artesianos
712012|Perforador De Pozos Petroliferos
712013|Sondista De Pozos En Explotacion
712014|Sondista, Conductor De Perforadora De Percusion, Petroleo Y
712015|Sondista, Excepto Pozos De Petroleo Y Gas
712016|Sondista, Pozos De Petroleo Y Gas
712017|Sondista, Recuperacion Y Mantenimiento De Cilindros De Petr
712018|Sondista, Conductores De Tren De Sondeo Por Rotacion,
712019|Tuberos De Sondeo
713001|Ayudante, Horno Alto
713002|Cargador De Horno Alto
713003|Colador De Horno Alto
713004|Fundidor De Alto Horno, Fusion De Mineral
713005|Fundidor De Convertidor De Acero, Al Oxigeno
713006|Fundidor De Convertidor Bessemer, De Acero
713007|Fundidor En El Afino Y Refino De Metales No Ferreos
713008|Fundidor En Hornos
713009|Fundidor En Horno De Acero Martin Siemens
713010|Fundidor En Horno Thomas
713011|Fundidor En Horno Electrico De Arco, Refino De Acero
713012|Fundidor En Horno De Conver. Y Afinado De Metal.No Ferreos
713013|Hornero De Alto Horno
713014|Hornero De Convertidor Bassemer
713015|Hornero De Conversion Y Afinacion De Metales  No Ferreos
713016|Hornero De Horno Thomas O Elkem
714001|Auxiliar De Tren De Laminacion
714002|Ayudante De Tren De Laminacion
714003|Laminador De Acero En Caliente
714004|Laminador De Acero En Tren Continuo
714005|Laminador De Acero En Frio
714006|Laminador De Metales No Ferreos
714007|Laminador De Productos Semiacabados De Acero
714008|Laminador De Tubos Sin Soldadura
714009|Maquinista De Tren De Laminacion
714010|Operario De Tren De Laminacion
714011|Operario De Laminado De Revestimiento
714012|Operario De Laminado Reversible
715001|Ayudante De Horno De Segunda Fusion O De Recalentado
715002|Colador De Horno De Segunda Fusion
715003|Fundidor De Crisoles, Segunda Fusion
715004|Fundidor De Cubilote
715005|Fundidor En Horno De Reverbero, Segunda Fusion
715006|Fundidor De Horno De Hogar Abierto, Seg. Fusion
715007|Fundidor En Horno Electrico, Segunda Fusion
715008|Fundidor En Segunda Fusion
715009|Hornero De Segunda Fusion
715010|Operador De Horno De Recalentar
716001|Colador De Horno A Presion
716002|Colador De Moldes A Maquina Centrifugadora
716003|Colador En Moldes, Piezas De Metal
716004|Fundidor De Piezas De Moldes
716005|Operador De Maquina Centrifugadora De Colada
716006|Operador De Maquina De Colar De Presion
716007|Operador De Maquina Colada Continua De Tubos Y Varillas
716008|Operario De Nave De Colada
716009|Operario De Colada Continua
717001|Preparador De Moldes Sobre Banco
717002|Constructor De Machos A Mano
717003|Constructor De Machos A Maquina
717004|Machero A Mano
717005|Machero A Maquina
717006|Moldeador A Maquina
717007|Moldeador De Artesa
717008|Moldeador De Caja
717009|Preparador De Moldes En El Suelo Y En Fosas
717010|Preparador De Moldes A Maquina
718001|Bronceador
718002|Cementador De Metales
718003|Cementador De Metales Por Nutricion
718004|Cementador De Metales Por Cianurizacion
718005|Cementador De Metales Por Carbonizacion
718006|Conductor De Prensa De Estirar Metales
718007|Cromador
718008|Electroplastia, Galvanizador
718009|Ementador De Metales
718010|Estirador De Tubos Sin Soldadura
718011|Extrusor De Metales
718012|Galvanizador En Baðo Caliente
718013|Metalizador A Pistola
718014|Metalizador En Baðo Caliente
718015|Niquelador
718016|Normalizador De Metales
718017|Operador De Maquina Recubridora De Alambre
718018|Otros Galvanizadores Y Recubridores De Metales
718019|Plateador
718020|Pulverizador De Metal A Pistola
718021|Puntero, Metales
718022|Recocedor De Metales
718023|Revestidor En Baðo Caliente
718024|Templador De Metales
718025|Trefilador A Mano
718026|Trefilador A Maquina
718027|Zincador En Baðo Caliente
719001|Decapador De Metales
719002|Desbastador De Piezas De Moldeo
719003|Limpiador De Metales
719004|Limpiador De Metales Por Ondas Ultrasonicas
719005|Limpiador Por Chorro De Arena, Metales
719006|Operador De Soplador De Arena, Para Limpiar Metales
719007|Pavonador De Metales
719008|Pulidor De Piezas De Metal Colado
719009|Pulidor De Piezas De Moldeo
721001|Impregnador De Madera
721002|Operador De Horno De Secado De Madera
721003|Secador De Madera
722001|Aserrador En General, Serrerias
722002|Clasificador De Madera
722003|Conductor De Descortezadora
722004|Cortador  De Chapa De Madera
722005|Cortador De Paja De Madera
722006|Descortezador A Maquina
722007|Encolador De Chapas De Madera
722008|Operador De Maquina Peladora Para Chapas
722009|Operador De Maquina Intercaladora De Chapas, Contrachapado
722010|Operador De Prensa De Contrachapado
722011|Operador De Prensa De Madera Terciada
722012|Operador De Sierra De Cinta
722013|Operador De Sierras De Recortar Tablas
722014|Serruchador,Aserradero
723001|Blanqueador De Pasta Para Papel
723002|Conductor De Desfibradora De Madera
723003|Conductor De Mojadoras, Pasta De Papel
723004|Conductor De Trituradoras, Pulpa De Madera
723005|Cortador De Trapos, Pasta De Papel
723006|Cortador De Viruta Para Pulpa De Madera
723007|Desfibrador Raspador De Madera
723008|Lejiador, Pasta Para Papel
723009|Operador De Batidora, Pulpa De Madera
723010|Operador De Caldera, Pasta Para Papel
723011|Operador De Maquina De Triturar Madera
723012|Operador De Pasta Para Papel En General
723013|Pasta De Papel Laurente
723014|Refinador De Pasta De Papel
723015|Trapero,Preparacion De Pasta Para Papel
724001|Conductor De Charoladora, Papel
724002|Conductor De Engomadora, Papel
724003|Conductor De Gofradora, Papel
724004|Conductor De Onduladora, Papel
724005|Conductor De Parafinadora, Papel
724006|Operador De Calandria De Papel
724007|Operador Maquina De Fabricar Papel, Fase Humeda, Fase Seca
724008|Operador De Maquina De Aprestar Papel
724009|Operador De Maquina Para Secado Y Enrollado, Papel
724010|Papelero, Fabricacion A Mano
724011|Plisador De Papel
724012|Satinador-Calandrador De Papel
731001|Moledor, Procedimientos Quimicos Afines
731002|Molinero, Tratamiento De Productos Quimicos Afines
731003|Operador De Batidora De Helice
731004|Operador De Maquina Mezcladora, Tratamiento Quimico Afines
731005|Operador De Quebrantadora, Tratamiento Quimicos Afines
731006|Triturador-Pulperizador, Procedimientos Quimicos Y Afines
732001|Calcinador, Tratamientos Quimicos Y Afines
732002|Cocedor, Tratamientos Quimicos Y Afines
732003|Cuadrista (De Sistesis, Gas)
732004|Deshidratador De Disoluciones Quimicos Por Pulverizacion
732005|Hornero, Fabricacion De Electrodos
732006|Hornero, Hornos Calcinacion, Tratamientos Quimicos Y Afines
732007|Operador De Autoclave, Tratamientos Quimicos Y Afines
732008|Operador De Caldera, Tratamientos Quimicos Y Afines
732009|Operador Hornos Calcinacion, Tratamientos Quimicos Y Afines
732010|Operador De Marmita, Tratamientos Quimicos Y Afines
732011|Operador De Secador, Tratamientos Quimicos Y Afines
732012|Pulverizador,Deshidratador De Disoluciones Quimicas
732013|Secador Productos Quimicos, Secador Cinta Transportadora
732014|Tostador, Tratamientos Quimicos Y Afines
733001|Cribador De Productos Quimicos
733002|Deshidratador Petroleo Crudo, Campos Extraccion
733003|Obrero Tratam. Petroleo Crudo, Campos Extraccion
733004|Operador De Centrifugadora
733005|Operador De Filtro-Prensa
733006|Operador De Filtro De Tambor Giratorio
733007|Operad Separadora Centrifugadora, Tratamiento Quimico Y Afi
733008|Tamizador, Tratamientos Quimicos Y Afines
734001|Destilador Productos Quimicos, Excepto Petroleo
734002|Destilador Productos Quimicos, Excepto Petroleo, Alambique
734003|Destilador De Madera
734004|Destilador De Trementina De Madera
734005|Destilador De Resina De Trementina
734006|Destilador, Bebidas Alcohol, Perfumeria, Glicerina
734007|Licorista, Destilacion
734008|Operador De Aparatos Reaccion, Conversion Productos Quimico
734009|Operador De Evaporador
734010|Refinador De Trementina
735001|Bombero, Refino Del Petroleo
735002|Destilador Del Petroleo
735003|Desulfurador, Refino Del Petroleo
735004|Desulfurador Hidrocaburos
735005|Mezclador, Refino Del Petroleo
735006|Operador De Cuadro De Control Refino Del Petroleo
735007|Operador De Filtros De Parafina
735008|Operador De Turbinas, Refino Del Petroleo
735009|Refino Del Petroleo,Bombero
736001|Hilador De Nylon
736002|Hilador De Rayon Y Similares
737001|Ahumador De Latex
737003|Hornero, Coqueria
737004|Lavador De Materias Quimicas
737005|Obreros De La Coagulacion De Latex
737006|Obreros Tratamiento Quimico De Materiales Radiactivos
737007|Obreros Del Tratamiento De Desechos Radiactivos
737008|Obreros En La Fabricacion De Abonos
737009|Obreros En La Fabricacion De Acidos
737010|Obrero, Fabricacion Colorantes, Tintes, Pinturas, Barnices
737011|Obrero, Fabricacion De Carusa
737012|Obrero, Fabricacion De Minio
737013|Obrero, Fabricacion Hidrogeno, Oxigeno, Acetileno, Otros
737014|Obrero, Fabricacion De Explosivos
737015|Obrero, Fabricacion De Comprimidos Y Grageas
737016|Operador De Bateria De Gas De Hulla
737017|Operador De Coqueria, Carbon De Coque
737018|Operador De Equipo Electronico,Tratamientos Quimicos
737019|Operador De Planta Para Licuefaccion De Gas
737020|Preparador De Almidon
737021|Preparador De Glucosa
737022|Preparador De Pigmentos
741001|Alimentadores De Cardas
741002|Batidor De Fibra
741003|Canalero Textil
741004|Cardador De Fibras
741005|Clasificador De Fibra
741006|Desfibrador De Lino O Yute
741007|Desmotador, Textil
741008|Despepitador, Algodon
741009|Diablero
741010|Emborrador De Lana
741011|Escogedor De Fibra
741012|Espapador
741013|Estirador De Fibra
741014|Lavador De Lana
741015|Manuarera
741016|Mezclador De Fibra
741017|Motosa O Raparadora, Seda
741018|Napador De Fibra
741019|Peinador De Fibra
741020|Rastrillador De Lino
741021|Torcedor De Mechas
741022|Triador De Fibra
742001|Aspeador, Textil
742002|Bobinador, Textil
742003|Devanador, Textil
742004|Encarretador, Textil
742005|Hilador De Torno
742006|Hilandero, Hilo E Hilaza
742007|Ovillador, Textil
742008|Pelotero, Textil
742009|Plegador De Hilos
742010|Retorcedor De Hilo O Hilaza
742011|Rodetero, Textil
742012|Torcedor De Hilo O Hilaza
742013|Trascanador De Madejas
742014|Obrero Textil
743001|Ajustador De Maquina Para Tejidos De Punto
743002|Ajustador De Peines, Telares
743003|Ajustador De Telares
743004|Ajustador De Telar Jacquard
743005|Copista De Diseðos Para Cartones Jacquard
743006|Enlazador De Cartones Jacquard
743007|Operador De Maquinas De Reproduccion Cartones Para Tejidos
743008|Picador De Cartones Jacquard
744001|Tejedor De Alfombras A Mano
744002|Tejedor De Alfombras En Telar Accionado A Mano
744003|Tejedor De Tapices,En Telar Accionado A Mano
744004|Tejedor De Telar A Mano
744005|Tejedor Ponchos O Mantas Telar Accionado A Mano
745001|Confeccionador De Velos Y Mantillas A Maquina
745002|Comprobador De Tejidos
745003|Controlador De Tejidos
745004|Controlador De Maquina Lectora Tejedora(Alfombras)
745005|Recontadora De Alfombras
745006|Remendador De Tejidos
745007|Reparadora De Alfombras
745008|Revisor De Tejidos, Obreros
745009|Tejedor De Alfombra A Maquina
745010|Tejedor De Redes
745011|Tejedor De Tul
745012|Tejedor De Telar Mecanico
745013|Tejedor De Telar Jacquard
745014|Urdidor
745015|Zurcidor De Tejidos
746001|Calcetero,Tejedor A Maquina
746002|Confeccionador De Tejidos De Punto
746003|Operador De Maquina De Tricot
746004|Tejedor A Maquina, Generos De Punto
746005|Tejedor A Maquina, Calceteria
746006|Tejedor De Calceteria, Con Bastidor Mecanico
746007|Tejedor De Punto En Maquina Hilan O Raschel
747001|Calcetero A Mano
747002|Tejedor De Punto En Bastidor Manual
747003|Tejedor De Punto En Maquina Accionada A Mano
747004|Tejedor De Punto A Mano
748001|Acabador De Tejidos
748002|Aderezador De Seda
748003|Aprestador De Tejidos
748004|Blanqueador
748005|Carbonizador De Lana
748006|Cargador De Seda
748007|Cepillador De Pana
748008|Desborrador De Textiles
748009|Descrudador De Productos Textiles
748010|Desgomador De Seda
748011|Encogedor De Productos Textiles
748012|Encolador, Textiles
748013|Gaseador, Textiles
748014|Impermeabilizador De Productos Textiles
748015|Impregnador De Productos Textiles
748016|Lavador De Hilados Y Productos Textiles
748017|Operador De Calandrias,Tejidos
748018|Perchador De Textiles
748019|Pilatero O Batanero
748020|Planchador De Generos Acabados
748021|Preparador De Aprestos Textiles
748022|Pulidor,Textiles
748023|Sanforizador
748024|Secador,Fabricacion De Textiles
748025|Tintorero De Fibras
748026|Tintorero De Hilados
748027|Tintorero De Ropas
748028|Tintorero De Tejidos
749001|Confeccionador De Conos De Fieltro Para Sombreros
749002|Cordonero A Mano
749003|Cordonero A Maquina
749004|Encajadero A Mano
749005|Flequero A Maquina
749006|Flequero A Mano
749007|Galonero A Maquina
749008|Ganchillero A Mano
749009|Hormador De Boinas
749010|Mallero
749011|Montador De Redes A Mano
749012|Hilanderos, Tejedores, Tintoreros, Trabajadores Asimilados
749013|Pasamanero A Mano
749014|Pasamanero A Maquina
749015|Preparador De Fieltro, A Maquina
749016|Federo A Mano
749017|Tejedor De Redes A Mano
749018|Teje Pulseras
751001|Adobador De Cueros
751002|Clasificador De Cueros Y Pellejos
751003|Cortador De Cueros,Curtidores
751004|Curtidor De Cueros
751005|Descarnador De Cueros A Mano
751006|Descarnador De Cueros A Maquina
751007|Hendedor De Cueros O Cortador De Cueros
751008|Lavador De Cueros
751009|Lustrador De Cueros
751010|Operador De Maquinas De Dividir Cueros
751011|Operador De Rebanadora De Cueros
751012|Pelador De Cueros A Mano
751013|Pelador De Cueros Y Pellejos A Maquina
751014|Pelambrero
751015|Pellejero, Curtidor
751016|Teðidor De Cueros
751017|Tintorero De Cueros
752001|Adobador De Pieles
752002|Clasificador De Pieles
752003|Depilador De Pieles
752004|Descarnador De Pieles
752005|Escogedor De Pieles Sin Tratar
752006|Estirador De Pieles
752007|Igualador De Pelo,Pieles
752008|Rasurador De Pieles
752009|Suavizador De Pieles
752010|Teðidor De Pieles A Mano
752011|Tintorero De Pieles A Mano
761001|Aventador De Granos,Molino
761002|Despolvador De Granos
761003|Molinero De Arroz
761004|Molinero De Cereales
761005|Molinero De Especias
761006|Molinero De Granos
761007|Operador De Pilon De Maiz
761008|Pesador De Granos
761009|Pulidor De Arroz
761010|Revolvedor De Granos
761011|Salvadero
761012|Secador De Arroz
761013|Semolero
762001|Carbonador, Refinacion De Azucar
762002|Cocedor, Refinacion De Azucar
762003|Comportero, Refinacion De Azucar
762004|Macerador De Remolacha
762005|Operador De Cristalizadora, Refinacion De Azucar
762006|Operador De Difusor, Azucar De Remolacha
762007|Operad. Instalaciones Proceso Continuo, Refin. Azucar
762008|Operador De Maquina Pulverizadora De Azucar
762009|Trapichero, Caða De Azucar
763001|Camalero, Matarife
763002|Chacinero
763003|Charcutero
763004|Choricero
763005|Cortador De Carne
763006|Degollador De Reses
763007|Descuartizador De Reses, Matarife
763008|Deshuesador
763009|Despostador, Carnes
763010|Despojero, Mataderos
763011|Escargado De Matadero
763012|Fiambrero, Carnes
763013|Mantequero (Manteca)
763014|Matancero
763015|Matancero En General
763016|Matarife
763017|Puntillero,Mataderos
763018|Tablajero, Carnes
763019|Tripero
764001|Acecinador
764002|Aceitador De Lleno Y Vacio, Conservas De Pescado
764003|Aderezador De Aceitunas
764004|Ahumador De Carnes Y Pescado
764005|Capataz O Contramaestre De La Conservacion De Alimentos
764006|Cocedor-Conservero, En General
764007|Cocedor De Salsas Y Condimentos
764008|Cocedor-Esterilizador
764009|Congelador De Alimentos
764010|Curador De Carne O Pescado
764011|Deshidratador De Alimentos
764012|Enlatador De Pescado
764013|Escabechero
764014|Limpiador De Frutas Y Hortalizas,Para Conservas
764015|Obrero De La Prepac. Y Conserv.  De Frutas Secas
764016|Operador De Evaporadora, Extractos Alimenticios
764017|Pelador De Frutas Y Hortalizas,Para Conservas
764018|Preparador De Mermeladas
764019|Preparador De Jamones O Jamonero
764020|Preparador De Bocaditos Envasados(Papa Frita,Camote,Etc)
764021|Preparador De Alimentos Concentrados
764022|Preparador De Charqui
764023|Rellenador De Aceitunas
764024|Salador De Alimentos,Carnes Y Pescado
764025|Salazonero
764026|Salchichero
764027|Secador De Pescado Al Sol
764028|Tonelero-Salador, Pesca
765001|Cultivador De Fermentos Lacteos
765002|Desecador-Pulverizador De Leche En Polvo
765003|Esterilizador De Productos Lacteos
765004|Heladero,Fabricacion
765005|Higienizador De Leche
765006|Horchatero
765007|Leche Condensada, Preparador
765008|Mantequillero O Mazador
765009|Moldeador De Mantequilla
765010|Operador De Batidora De Helados
765011|Operador De Maquina De Homogenizacion De La Leche
765012|Pasteurizador De Leche Y Productos Lacteos
765013|Preparador De Manjarblanco Y Natillas
765014|Preparador De Leche Condensada
765015|Preparador De Yougurt Y Cremas
765016|Quesero
765017|Refrigerador De Leche O Productos Lacteos
765018|Requesonero
765019|Salador De Queso
766001|Amasador De Pan
766002|Arropiero
766003|Catador De Cafe O De Te
766004|Clasificador De Cafe O De Te
766005|Chancaquero, Elaborador De Chancaca
766006|Chocolatero, Preparador
766007|Churrero, Preparador
766008|Colocador De Tablas, Panaderia
766009|Confitero, Preparador
766010|Dulcero, Preparador
766011|Escarchador De Frutas
766012|Fidero
766013|Galletas, Fabricacion, Operador Maquinas Sobadora De Masa
766014|Galletas, Operador De Troquel
766015|Goma Mascar, Chicle, Operador Maquinas De Fabricar
766016|Hojaldrista
766017|Hornero De Pan
766018|Laminador De Chocolates
766019|Laminador De Galletas
766020|Mazapan, Confeccionador
766021|Mezclador De Ingredientes, Fabricacion Chocolate
766022|Melcochero, Preparador
766023|Mezclador De Cafe
766024|Mezclador De Te
766025|Molinero De Cafe
766026|Molinero De Cacao
766027|Molinero De Cacao,Fabricacion De Chocolates
766028|Oficial De Masa O De Pala,Panaderia
766029|Operador De Maquina De Fabricar Pastas Alimenticias
766030|Operador De Maquina De Goma De Mascar,Chicle
766031|Operador Maq.Calibradora-Cortadora Masa, Fabric. De Galleta
766032|Operador Maq.Sobadora Masa, Fabricacion Galletas
766033|Operador De Troquel De Galletas
766034|Panadero-Pastelero,En General
766035|Pastelero, Preparador
766036|Prensador De Cacao, Fabricacion De Chocolate
766037|Preparador Pastas Pasteleria En Moldes A Maquina
766038|Preparador De Pastas Alimenticias
766039|Repostero,Elaboracion De Pasteles Y Otros
766040|Torrefactor De Cafe
766041|Torrefactor De Achicoria Y Otros Sucedaneos
766042|Tostador De Cafe
766043|Tostador De Cacao
766044|Turronero, Preparador
767001|Acetificador
767002|Capataz O Contramaestre De Elaboracion De Bebidas
767003|Catador De Vinos Y Licores
767004|Cervecero, Germinacion
767005|Clasificador De Vinos
767006|Enfrascador De Vinos
767007|Cocedor De Malta
767008|Cocedor De Mosto, Cerveza
767009|Desecador De Malta
767010|Fermentador
767011|Fermentador De Vinos
767012|Filtrador De Cerveza
767013|Gaseador De Sidra
767014|Lagarero, Vinos
767015|Lavador De Pasta,Sidra
767016|Maltero, Germinacion
767017|Mezclador De Vinos
767018|Obrero De La Elaboracion De Vinos
767019|Obrero De La Fabricacion De Levadura
767020|Obrero De La Germinacion De Granos,Cerveza
767021|Obrero De Vinos Achampanados
767022|Obrero Elaboracion Sodas, Gaseosas Y Otras Bebidas No Alcoh
767023|Operador De Prensas De Frutas
767024|Pisador De Uva
767025|Prensador De Uva
767026|Preparador De Bebidas Carbonicas Y Jarabes
767027|Secador De Malta
767028|Sidrero
767029|Trasegador De Vinos
767030|Vinagrero
768001|Almazarero
768002|Descascarador O Tostador De Mani
768003|Descascarador De Frutas Secas
768004|Descascarador De Nueces
768005|Despinador De Pejerreyes Y Otros Pescados
768006|Extractor De Aceite De Orujo
768007|Hidrogenador De Aceites Y Grasas
768008|Limpiador De Camarones
768009|Limpiador De Pejerreyes Y Otros Pescados
768010|Operador De Desdobladora, Aceite Y Derivados
768011|Operador De Hidrogenadora, Aceite Y Derivados
768012|Operador De Maq. Coaguladora, Grasa Vegetales
768013|Pelador De Camarones
768014|Pelador De Mani
768015|Pescadero, Limpiador De Pescado
768016|Preparador De Margarina
768017|Refinador De Aceites Y Grasas
768018|Tostador De Cacahuates O Almendras
768019|Preparador De Tamales
769001|Abridor De Capa Y Capillos,Elaboracion Cigarro
769002|Acondicionador De Tabaco
769003|Cigarrero A Mano
769004|Cigarrero A Maquina
769005|Clasificador De Cigarros
769006|Clasificador De Tabaco
769007|Despalillador De Tabaco A Mano
769008|Despalillador De Tabaco A Maquina
769009|Desvenador De Tabaco A Mano
769010|Desvenador De Tabaco A Maquina
769011|Enfriador De Tabaco
769012|Escogedor De Tabaco
769013|Humectador De Tabaco
769014|Laminador De Vena,Tabaco
769015|Ligador De Tabaco
769016|Mezclador De Tabaco
769017|Mojador De Tabaco
769018|Operador De Maquina De Picar Tabaco
769019|Operador De Maquina Secadora De Tabaco
769020|Operador De Maquina De Hacer Cigarrillos
769021|Operador De Maquina De Hacer Filtros Cigarrillos
769022|Operador Maq. Estampar Marcas De Los Cigarrillos
769023|Operador De Maquina De Embolsar Cigarrillos
769024|Oreador De Tabaco
769025|Picador De Tabaco
769026|Prensador De Cigarrillos
769027|Prensador De Tabaco De Mascar
769028|Preparador De Rape
769029|Preparador De Picadura De Tabaco Para Pipa
769030|Purero A Mano
769031|Refrescador De Tabaco
769032|Rezagador, Fermentado Del Tabaco
769033|Rezagador De Capote, Elaboracion De Cigarrillos
769034|Rezagador De Capa, Elaboracion De Cigarros
769035|Tendedor De Tabaco
769036|Terrefactor De Tabaco
769037|Torcedor De Tabaco A Mano,Elaboracion Cigarros
769038|Torcedor De Tabaco A Maq. Elaboracion De Cigarros
771001|Camisera
771002|Corsetera
771003|Costurera-Modista
771004|Chalequero,Confeccion En Serie
771005|Maestro De Aguja Y Mesa,Sastre
771006|Modista De Teatro
771007|Modiston, Modisto
771008|Pantalonero, Confeccion En Serie
771009|Sastre, Confeccion En Serie
771010|Sastre, A Medida
771011|Sastre, Cortador
772001|Acabador De Trabajos De Peleteria
772002|Bordadores A Mano O A Maquina En General
772003|Clavador De Pieles
772004|Combinador De Pieles Valiosas
772005|Cosedor A Mano Y A Maquina, En General
772006|Cosedor A Mano Prendas Vestir,Excepto Calzado Cuero
772007|Cosedor A Mano De Prendas De Peleteria
772008|Cosedor A Maquina-Remalladores
772009|Escogedor Y Combinador De Pieles Valiosas
772010|Manguitero O Peletero
772011|Peletero
773001|Acabador Y Adornador De Sombreros
773002|Operador De Maquinas De Sombreros De Fieltro
773003|Sombrerero,Inclusive De Sombreros De Paja
774001|Cortador De Guantes
774002|Cortador Prendas Vestir,Inclusive Cuero Y Piel
774003|Cortador Ropa Blanca, Tapiceria, Telas Paraguas
774004|Cortador De Toldos Y Sombrillas, Tiendas Campaða
774005|Cortador De Vestidos, Inclusive De Cuero Y Piel
774006|Cortador De Velas De Embarcaciones
774007|Cortador, Sastreria
774008|Patronista Prendas Vestir, Lenceria, Sombreros, Gorros
774009|Patronista De Ropa Blanca
774010|Patronista Tiendas Campaða,Toldos,Sombrillas
774011|Patronista De Velas De Embarcaciones
774012|Patronista De Tela De Paraguas
774013|Trazador De Prendas De Vestir, Lenceria
775001|Colchonero
775002|Confeccionador De Colchas
775003|Confeccionador De Cortinas
775004|Confeccionador De Ropa De Tapiceria
775005|Confeccionador De Edredones
775006|Tapicero De Muebles
775007|Tapicero De Vehiculos
776001|Abornador De Cueros
776002|Artesano Del Cuero, En General
776003|Cosedor De Cuero (Maletas, Carteras, Bolsas)
776004|Cortador De Cueros, Confecciones De Articulos
776005|Guarnicionero
776006|Maletero, Cuero O Marroquin
776008|Marroquinero, Fabricacion De Articulos De Cuero
776009|Montador De Articulos De Cuero
776010|Repujador De Cueros
776011|Talabartero
776012|Troquilador De Cueros
777001|Acabador De Calzado
777002|Aparador De Calzado
777003|Armador De Calzado
777004|Cortador Empeines Calzado, A Maquina O A Mano
777005|Cortador De Palas De Calzado, A Maquina O A Mano
777006|Cortador De Suelas
777007|Cosedor De Calzado, A Maquina
777008|Despuntador De Suelas
777009|Guarnecedor De Calzado
777010|Hormero, Armador De Calzado
777011|Lijador De Cantos, Calzado
777012|Montador De Palas De Calzado
777013|Montador De Suelas
777014|Patronista Del Calzado
777015|Preparador De Palas De Calzado
777016|Preparador De Suelas
777017|Zapatero Ortopedista
778001|Ajustador-Operador De Cepilladora, Labra Madera
778002|Ajustador-Operador Molduradora, Labra De Madera
778003|Ajustador-Operador Ranuradora, Labra De Madera
778004|Ajustador-Operador Torno, Labra De Madera
778005|Ajustador-Operador De Maq. Labrar Madera En Gral
778006|Ajustador-Operador De Sierra Mecanica De Precision
778007|Ajustador-Operador Torno Automatico, Labra Madera
778008|Ajust-Operad Fresadora-Grabadora, Labra De Madera
778009|Ajustador De Maq. De Labrar Madera En General
778010|Acabador De Muebles De Madera
778011|Carrocero, Carrocerias De Madera
778012|Cepillador De Madera
778013|Chapeador De Muebles De Madera
778014|Charolador
778015|Confeccionador Muebles Madera Para El Hogar U Oficina
778016|Confeccionador De Articulos Madera Para Deporte
778017|Constructor De Carretas O Carretillas(Madera)
778018|Constructor De Ataudes
778019|Constructor De Kioscos De Madera
778020|Curvador De Madera
778021|Ebanista, Marqueteria
778022|Ebanista De Mesa De Billar
778023|Ebanista De Pianos
778024|Ebanistas De Estuches Para Instrumentos
778025|Ebanista O Carpintero En Madera, Excepto Construccion
778026|Laqueador De Muebles De Madera
778027|Maquetista En Madera
778028|Modelista En Madera
778029|Mueblista De Madera En General
778030|Operador De Maq. De Labrar Madera,En General
778031|Operador De Maquinas De Labrar, En General
778032|Pipero, Pipas De Fumar
778033|Restaurador De Articulos De Madera
778034|Tallador De Madera
778035|Tallista, Madera
778036|Tonelero
778037|Tornero,Labra De Madera
778038|Trazador De Ebanisteria
778039|Trazador, Labrado De Madera
778040|Tupista, Labra De Madera
779001|Confeccionador De Velas,Carpas Y Toldos
779002|Confeccionador De Alfombras De Nudos A Mano
779003|Confeccionador De Bolsas De Hilo
779004|Confeccionador De Calzado De Caðamo
779005|Confeccionador De Calzado De Lona
779006|Confeccionador De Flores Artificiales(De Tela)
779007|Confeccionador De Plumeros De Tela
779008|Guarnecedor Con Plumas De Adorno
779009|Paraguero
781001|Ajustador-Modelista,Fundicion
781002|Ajustador De Mandriles Y Calibradores
781003|Ajustador-Modelistas Y Trazadores Matrices En Metal
781004|Ajustador-Operador Maq. Herramientas, En General
781005|Ajustador-Operador De Torno
781006|Ajustador-Operador De Fresadora,Incluye De Metal
781007|Ajustador-Operador Cepilladora, Incluye Metales
781008|Ajustador-Operador Mandriladora De Metales
781009|Ajustador-Operador De Taladradora
781010|Ajustador-Operador Rectificadora, Incluye Cilindros Y Metal
781011|Ajustador-Operador De Esmeriladora De Metales
781012|Ajustador-Operador De Maquina De Lapidar
781013|Ajustador-Operador De Escopleadora De Metales
781014|Ajustador-Operador De Torno De Roscar
781015|Ajustador-Operador De Maq. De Tallar Engranajes
781016|Ajustador-Operador De Maquina Mortajadora
781017|Ajustador-Operador De Maquinas De Mecanismo Numerico De Con
781018|Ayudante De Herrero
781019|Afilador En General
781020|Amolador De Sierras
781021|Armero
781022|Carpinteria Metalica
781023|Cepillador De Metales
781024|Cerrajero
781025|Combero
781026|Confeccionador A Mano De Piezas De Metal
781027|Escopetero
781028|Fresador
781029|Forjador
781030|Herramentista
781031|Herrador,Herrero
781032|Herrero,En General
781033|Llaverero
781034|Mandrilador
781035|Mandrilero
781036|Martillador-Herreria
781037|Mecanico-Ajustador
781038|Mecanico Especialista En Herramientas Y Matrices
781039|Modelista-Ajustador, Fundicion
781040|Operador Maquinas Herramienta Automatica Mando Numerico
781041|Operador De Esmeriladora
781042|Operador De Escopleadora
781043|Operador De Maquinas Herramientas En General
781044|Operador De Maquina De Funcion Multiple
781045|Operador De Maquina De Transferencia Automatica
781046|Operador De Maquina De Tallar Engranajes
781047|Operador De Maquina Lapiadora De Metales
781048|Operador De Sierra Mecanica De Metales
781049|Operador De Taladradora De Metal
781050|Operador De Maquinas Para Fabricar Tornillos
781051|Obreros De La Manufactura A Mano De Pzas Metal
781052|Obreros Fcion Muelles, Clavos, Tornillos, Cables
781053|Operador De Cizalla Mecanica
781054|Operador De Maquina De Curvar Metales
781055|Operador De Prensa Mecanica,De Metales
781056|Operador De Tijera Mecanica
781057|Operador De Torno De Embutir
781058|Pulidor De Metales, A Maquina
781059|Pulidor De Metales, A Mano
781060|Rectificador De Metales
781061|Rectificador De Cilindros,Trabajo De Metales
781062|Reguladores De Maquina Herramientas, En General
781063|Regul-Operad Revolveres Para El Trabajo De Metales
781064|Regulador-Operador De Torno Automatico De Metal
781065|Taladrista
781066|Trazador En Metales
781067|Tornero,Labra De Metales
781068|Tornero De Embutir
781069|Carpintero Mecanico
782001|Ayudante De Mecanico De Vehiculos De Motor
782002|Mecanico Automoviles, Camiones, Motocicletas, Autobus, Trac
782003|Mecanico De Direccion Y Frenos De Automoviles
782004|Mecanico De Motores De Avion,En General
782005|Mecanico De Motores De Barcos,En General
782006|Mecanico Naval
782007|Mecanico De Sala De Maquinas De Barcos
782008|Mecanico De Maquinas En General: Agricultura, Oficina, Text
782009|Mecanico Motores Diesel,Excepto Motor Automoviles Y Camione
782010|Mecanico De Turbinas,Excepto Turbinas De Avion
782011|Mecanico Engrasador,Excepto Barcos
782012|Mecanico Reparador De Bicicletas
782013|Montador De Manufacturas Metalicas
782014|Probador De Automoviles,Reparaciones
782015|Reparador De Bicicletas
782016|Revisor Y Probador De Maquinaria
782017|Samuelles-Muellero
783001|Ajustador Electricista En General
783002|Ajustadores Electricistas De Motores Y Dinamos
783003|Ajustadores Electricistas De Transformadores
783004|Ajustadores Electricistas Equipos Centrales Electricos
783005|Ajustadores Electricistas Ascensores Y Similares
783006|Ajustador Electronicista
783007|Bobinador Electricista
783008|Controlador Calidad Aparat. Electric. Y Electronicos
783009|Debanador, Electricista
783010|Electricista Bobinador
783011|Electricista-Montador,Aire Acondicionado
783012|Electricistas Gral., Construc. Instal. Elec., Cine
783013|Electricista De Barcos Y Aviones
783014|Electricista De Vehiculos
783015|Empalmador De Cables Electricos
783016|Inspector Control Calidad, Equipo. Electric. Y Electronicos
783017|Inspector Calidad Aparat. Electric. Y Electronicos
783018|Inspector De Distintivo De Calidad
783019|Instalador Electricista,Ascensores Y Equipo Similar
783020|Instalador De Antenas De Radio Y Television
783021|Instalador De Telefonos Y Telegrafos
783022|Instalador Cables Para La Electrificacion Ferrocarriles
783023|Instalador Lineas Energia Electrica, Tendido Aereo
783024|Instalador De Cables De Energia Electrica
783025|Instalador De Lineas Electricas Para Traccion
783026|Instalador De Cables
783027|Instalador Cables Para Traccion Vehiculos Elect.
783029|Instalador De Cables De Telefonos Y Telegrafos
783030|Instalador De Lineas Subterraneos
783031|Instalador Lineas Electricas Y Telecomunicaciones
783032|Instalador De Lineas De Telecomunicaciones
783033|Mecanico-Reparador De Receptores Radio Y Tv
783034|Mecanico De Telefono Y Telegrafos
783035|Mecanico Reparador De Telefonos Y Telegrafos
783036|Montador De Instalaciones Telefonicas Y Telegrafo
783037|Montador Electricista, Ajustador En General
783038|Montador, Ascensores Y Equipo Similar
783039|Montador O Ensamblador Aparatos Elect. Y Electro.
783040|Montador De Radios
783041|Montador De Tubos Electronicos
783042|Montador Cables De Transporte De Energia Electrica
783043|Montador De Cables Subterraneas
783044|Montador Lineas Aereas Para Transporte De Corriente
783045|Montador De Lineas Catenarias
783046|Montador De Lineas Telefonicas Y Telegraficas
783047|Montador De Lineas Subterraneos
783048|Reparador De Receptores De Radio Y Tv
783049|Radio Tecnico Reparaciones De Radio Y Tv
783050|Reparador De Aparatos Electrodomesticos
783051|Reparador Electricista De Aparatos Electrodomesticos
783052|Reparador Instalaciones De Telefonicos Y Telegrafos
784001|Controlador De Sonido,Estudios De Radio Y Tv
784002|Operador De Aparatos De Estudios De Radio Y Tv
784003|Operador De Equipo De Transmision De Radio Y Tv
784004|Operador Equipo Estudios Radiodifusion O Tv
784005|Operador Estacion Emisora De Radio Y Tv
784006|Operador De Estacion Emisora Radio Y Tv,De Equipo
784007|Operador De Imagen De Television
784008|Operador De Radio Y Television
784009|Operador De Video
784010|Operador De Aparato De Proyeccion,Cine
784011|Operador De Cabina, Cinematografica, Salas Cine
784012|Operador De Equipo De Grabacion O Reg. De Sonido
784013|Operador Equipo De Amplificacion De Sonido
784014|Operador De Video O Betamax
785001|Ajustador De Tuberias En General, De Gas, En Aviones
785002|Armador De Cajas De Acero En Taller
785003|Armador De Estructuras De Acero
785004|Armador Hierro Y Acero, Blindaje, Construc Navales
785005|Armador De Barcos
785006|Ayudante De Hojalateria
785007|Ayudante De Remachador De Estructuras Metalicas
785008|Calderero, Cobre Y Aleaciones Ligeras Chapas Acero
785009|Calentador Al Rojo De Remaches
785010|Carrocero, Automoviles, Aviones Y Otros
785011|Corrocero De Automoviles
785012|Conductor De Maquina De Soldar Por Arco Electrico
785013|Cortador De Metales Con Soplete
785014|Chapista En Gral., Caldero, Hojalatero, Decoracion
785015|Fontanero,En General
785016|Gasfitero
785017|Hojalatero O Chapista
785018|Instalador Tuberias,En Gral,Gas,Barcos,Aviones
785019|Montador De Calderas
785020|Montador Construcc. Metalicas, Excepto Buques
785021|Montador Estructuras De Acero,Excepto Buques
785022|Montador De Planchas,Astilleros
785023|Operador De Gasometro
785024|Oxicortador En General, A Mano O A Maquina
785025|Operario De Mesa De Corte, Oxicortador
785026|Operario De Oxicorte
785027|Planchador De Carrocerias De Vehiculos
785028|Plomero
785029|Preparador De Estructuras De Acero En Taller
785030|Reblonador Planchas Metal, A Mano O Maq., Plancha
785031|Remachador, Mano O Maq. Planchas Met., Martillo Neu.
785032|Replanteador De Estructuras, Metalicas
785033|Soldador-Plomero
785034|Soldador Con Soplete Y Por Arco Electrico,Gral
785035|Sopletista De Corte, A Mano
785036|Sopletista Soldador
785037|Soldador N.E.O.P.
785038|Soldador De Cautin (Cautil)
785039|Trazador De Caldereria Y Chapas
785040|Trazador De Planchas Y Chapas Metalicas
785041|Trazador De Estructuras Metalicas
785042|Trazador De Galibos, Astilleros
785043|Tubero En General, Distribucion Gas, Aire A Presion, Vapor
791001|Arreglo De Maquina De Escribir, Calculadoras, Etc.
791002|Ajustador, Montador De Motores A Gasolina
791003|Ajustador, Montador De Motores Diesel
791004|Ajustador, Montador De Motores De Combust.Int.(Ex.Mot.Avion
791005|Ajustador-Montador De Motores Marinos
791006|Ajustador-Montador De Motores Avion,Reaccion
791007|Ajustador-Montador Excepto Motores Combus. Interna
791008|Constructor De Brujulas
791009|Constructor De Balanzas
791010|Constructor De Barometros, Termometros
791011|Instrumentista, Instrumentos De Precision
791012|Mecanico-Montador Maquina, Equipo Industrial, Aire Acondici
791013|Mecanico, Ajustador De Maquinaria En General
791014|Mecanico De Balanzas
791015|Mecanico De Camaras Fotograficas
791016|Mecanico De Instrumentos De Optica
791017|Mecanico De Instrumentos De Laboratorio
791018|Mecanico De Instrumentos De Odontologia
791019|Mecanico De Instrumento Quirurgicos
791020|Mecanico De Protesis Ortopedicas
791021|Mecanico De Protesis Dentales
791022|Mecanico Dentista
791023|Mecanico Ortopedista
791024|Mecanicos De Instrumentos De Precision
791025|Montador De Aparatos Fotograficos
791026|Montador De Instrumentos De Precision
791027|Relojero
791028|Reparador De Relojes
792001|Batihoja,Joyero O Platero
792002|Cincelador-Orfebre
792003|Diamantista-Pulidor Y Tallador De Piedras Preciosas
792004|Engastador
792005|Esmaltador De Metales Preciosos
792006|Filigranista,Joyero O Platero
792007|Grabador De Metales Preciosos
792008|Grabador De Plateria Y Joyeria
792009|Laminador De Metales Preciosos
792010|Lapidario, Tallador Y Pulidor De Piedras Preciosas
792011|Martillador De Metales Preciosos
792012|Montador De Piedras Preciosas
792013|Montador, Orfebreria
792014|Orfebre, Joyero O Platero
792015|Orfebreria, Cincelador (Joyero O Platero)
792016|Plateria, Grabador
792017|Platero Y Orfebre
792018|Recalcador De Metales Preciosos
792019|Reparador, De Joyas
792020|Repujador, Otro Joyero O Platero
792021|Tallador Y Pulidor De Piedras Preciosas
792022|Tornero-Repujador Orfebreria
792023|Trefilador De Metales Preciosos
793001|Acabador De Bordes,Cristal
793002|Afinador A Maquina De Cristales De Optica
793003|Afinador De Vidrio,Optica De Anteojeria
793004|Biselador De Cristales
793005|Conductor De Maquina De Estirar Vidrio Plano
793006|Cortador, Tallador De Cristales De Optica
793007|Cortador De Vidrio
793008|Curvador De Tubos De Vidrio
793009|Desbastador, Optica En Anteojeria
793010|Esmerilador De Bordes,Vidrio
793011|Esmerilador De Lentes A Maquina
793012|Laminador De Lunas De Vidrio
793013|Modelador De Lentes
793014|Operador De Bano Metalico Por Flotacion Vidrio
793015|Operador De Maquina De Moldear O Soplar Vidrio
793016|Operador Maquina Estirar Vidrio Plano,Varillas O Tubo
793017|Operador En Prensa De Moldear Vidrio
793018|Operador Vertido Vidrio Fundido/Vertidor Vidrio Fundido
793019|Pulidor A Maquina De Cristales De Optica
793020|Pulidor De Cristales
793021|Pulidor De Lentes
793022|Soplador Vidrio,Material Laboratorio A Maquina
793023|Tallador De Cristales De Optica
794001|Alfarero,En Gral,Excepto Ladrillos,Adobes,Tejas
794002|Amasador De Caolin,Porcelana
794003|Ceramista Moldes, A Mano Excepto Ladrillos, Adobes, Tejas
794004|Cribador De Tierra, Ceramica
794005|Ceramista En Gral,Excepto Adobes,Ladrillos,Tejas
794006|Cincelador De Piezas De Ceramica
794007|Colador De Ceramica,Excepto De Adobe Y Ladrillo
794008|Extrusor De Arcilla,Ceramica
794009|Machero-Moldeador,Ceramica
794010|Mezclador De Pasta De Abrasivos
794011|Modelador Al Torno Con Terraja,Ceramica
794012|Modelista De Ceramica
794013|Moldeador De Muelas Abrasivas
794014|Moldeador Machero De Ceramica
794015|Molinero,Tierra De Loza
794016|Operador De Filtro Prensa Para Arcilla(Ceramica)
794017|Operador De Prensa De Ceramica
794018|Operador De Prensa Galletera, Ceramica
794019|Prensador De Ceramica, Con Troquel
794020|Preparador De Barbotin
794021|Preparador De Moldes, Ceramica, Loza Y Porcelana
794022|Preparador Ceramica En Moldes, Pasta De Arcilla
794023|Taladrador De Piezas De Ceramica
794024|Tamizador De Tierras, Ceramica
794025|Tornero-Alfarero En Torno De Pedal
794026|Tornero En Torno De Pedal, Loza Y Porcelana
794027|Vaciador De Ceramica En Moldes
795001|Adobero
795002|Colador De Ladrillos Y Tejas
795003|Moldeador De Ladrillos Y Baldosas
795004|Operador De Maquina De Cortar Ladrillos Y Tejas
795005|Operador Prensa Alta Presion Para Ladrillos Especiales
795006|Preparador De Adobes
795007|Prensador De Adobes Con Troquel
795008|Tejero Y Adobero A Mano
796001|Ayudante De Horno De Ceramica,Encendido
796002|Cargador-Descargador De Horno,De Ceramica
796003|Fundidor Vidriero
796004|Hornero,Briquetas
796005|Hornero,Ceramica
796006|Hornero,Fabricacion De Vidrio
796007|Hornero,Loza Y Porcelana
796008|Hornero,Material Refractario Excepto Tejas Y Ladrillos
796009|Hornero,Porcelana
796010|Hornero,Recocido Del Vidrio
796011|Hornero,Tejas Y Ladrillos
796012|Hornero,Templado Del Vidrio
796013|Moldeador De Crisoles
796014|Operador De Secador De Briquetas
796015|Preparador De Caja De Secado,Horno De Ceramica
796016|Templador De Vidrio
797001|Esmerilador Con Chorros De Arena,Vidrio
797002|Esmerilador Vidrio O Cristal Con Chorro De Arena
797003|Grabador De Agua Fuerte,Cristal
797004|Grabador De Ceramica Vidriada
797005|Grabador De Cristal En General
797006|Grabador De Vidrio En General
797007|Pulidor De Vidrio O Cristal En Baðo De Acido
797008|Tallador De Cristales-Vidrios,Talla Decorativa
797009|Tallador De Vidrio O Cristal
798001|Azogador
798002|Decorador De Ceramica
798003|Decorador De Vidrio
798004|Esmaltador De Vidrio
798005|Esmaltador De Ceramica
798006|Filetero, Decorado De Ceramica
798007|Iluminador De Loza Y Porcelana
798008|Pintor A Pistola,De Loza Y Porcelana
798009|Pulidor De Ceramica Dorada
798010|Retocador, Decorado De Ceramica
798011|Trazador, Decorado De Ceramica
798012|Vidriador De Ceramica
799001|Extrusor De Hilos De Fibra De Vidrio
799002|Hilador De Vidrio
799003|Mezclador De Materiales,Fabricacion De Vidrio
799004|Operador De Maquina Para Fabricar Fibra Vidrio
799005|Operador De Maquina Para Fabricar Lana De Vidrio
799006|Preparador De Fibra De Vidrio
811001|Abarquero
811002|Alisador De Productos De Caucho
811003|Amasador De Caucho
811004|Armador De Productos De Caucho
811005|Calandrador De Caucho
811006|Capataz O Contramaestre De La Fab. De Productos De Caucho
811007|Conductor De Maquina De Estirado De Caucho
811008|Confeccionador-Montador De Articulos De Caucho
811009|Cortador De Caucho
811010|Engomador De Tejidos De Caucho
811011|Ensamblador De Productos De Caucho
811012|Extrusor De Caucho
811013|Impregnador De Caucho
811014|Lustrador De Caucho
811015|Mezclador De Caucho
811016|Montador De Productos De Caucho
811017|Obrero Del Apomazado Del Caucho
811018|Obrero En La Fabric. De Articulos De Caucho
811019|Operador De Calandria De Caucho
811020|Operador De Maquina Amasadora De Caucho
811021|Operador De Maquina Calandradora De Caucho
811022|Operador De Maquina Estiradora De Caucho
811023|Operador De Prensa De Moldear Caucho
811024|Vulcanizador Artic. Caucho, Excepto Neumaticos
812001|Armador De Productos De Plastico
812002|Confeccionador De Productos De Plastico
812003|Ensamblador De Productos De Plastico
812004|Extrusor De Plastico
812005|Moldeador De Plastico Por Inyeccion
812006|Moldeador De Plastico Por Compresion
812007|Montador De Productos De Plastico
812008|Operad Maq. De Moldear Materias Plasticas Por Inyeccion
812009|Operar Maq. De Moldear Materias Plasticas Por Compresion
812010|Operador De Maquina De Fabricar Bolsas Plastico
812011|Operador Maquina Estiradora De Plastico
812012|Operador De Maquina De Sellar Plasticos
812013|Preparador De Paneles De Plastico
812014|Pulidor De Productos De Plastico
812015|Recortador A Maquina De Prod. De Plastico
812016|Taladradora De Productos De Plastico
813001|Ayudante De Reencauchador De Neumaticos
813002|Confeccionador De Neumaticos,Primera Fase
813003|Cortador De Acanaladuras En Neumaticos
813004|Cortador De Estuas En Neumaticos
813005|Fabricante De Neumaticos,Primera Fase
813006|Moldeador De Neumaticos
813007|Moldeador Y Vulcanizador De Neumaticos
813008|Rencauchador De Neumaticos
813009|Vulcanizador Y Moldeador De Neumaticos
821001|Armador De Cajas De Carton A Maquina
821002|Capataz O Contamestre De La Confeccion De Productos De Pape
821003|Cartonero A Maquina
821004|Conductor De Maquinas De Fabricar Tubos Papel
821005|Conductor De Prensa De Embutir El Carton
821006|Confeccionador De Cajas De Carton
821007|Confeccionador A Maq. De Bolsas Y Sobres De Papel
821008|Confeccionador De Bolsas De Celofan
821009|Confeccionador De Sobres A Mano
821010|Confecc. Artic. Adornos Y Fantasia En Papel
821011|Confeccionador De Maletas De Carton
821012|Confeccionador De Papel
821013|Emsamblador De Naipes
821014|Montador De Cajas De Carton A Mano O A Maquina
821015|Operador De Maquina De Forrar Carton
821016|Operador De Maquina Pegadora De Papel En Carton
821017|Operador De Maquina De Cortar Y Pegar Carton
821018|Operador De Maquina Prensadora De Carton
821019|Operad Maq. Pegadora Y Cerradora Bolsas Y Sobres
821020|Operador Maq. Confeccionar Bolsas Y Sobres Papel
821021|Operador De Prensa De Embutir Carton
831001|Armador De Paginas, Imposicion
831002|Cajista, Imprenta
831003|Compaginador De Foto-Composicion
831004|Compositor,Imposicion
831005|Fundidor De Monotipia Y Tipos Sueltos
831006|Imponedor
831007|Impresor De Pruebas
831008|Impresor En General
831009|Linotipista
831010|Maquinista De Foto-Composicion
831011|Minervista
831012|Monotipista
831013|Operador De Maquina Fundidora De Tipos
831014|Operador De Maquina De Fototipia, Imprenta
831015|Operador De Monotipia De Fundir
831016|Operador De Teclado De Monotipia
831017|Platinero, Compaginacion
831018|Preparador De Braille, Planchas De Imprenta
831019|Preparador De Planchas De Imprenta Braille
831020|Teclista Monotipista
831021|Tipografo En General
831022|Empleado O Ayudante De Imprenta En General
832001|Conductor De Prensa De Heliograbado
832002|Impresor De Papeles
832003|Maquinista De Rotativa A Colores,Imprenta
832004|Maquinista De Offset
832005|Maquinista Platinero
832006|Marcador, Introduc. Hojas En Maq. De Imprimir
832007|Operad Prensa Rotativa, Offset, Cilindro, Platina, Litograf
832008|Otros Operadores De Prensa De Imprimir
832009|Tipografo Operador De Prensas De Imprimir
833001|Clisador-Electrotipista
833002|Electrotipista, Imprenta
833003|Estereotipador, Imprenta
833004|Estereotipista, Imprenta
833005|Fundidor Estereotipista
833006|Galvanoplastista O Clisador
833007|Matriceros, Imprenta
833008|Moldeador De Clises Por Galvanoplastia, Imprenta
833009|Reproductor De Clises, Reproduccion En Plastico
834001|Grabador A Mano Clises Madera, Caucho O Linoleo
834002|Grabador Con Pantografo
834003|Grabador De Imprenta
834004|Grabador De Piedras Litograficas
834005|Grabador Planchas, Cilindros Y Matrices Metalico
834006|Grabador, Burilista, Litografista, Grabado Imprenta
834007|Pantografista, Imprenta
834008|Transportador, Litografia
834009|Xilografo
835001|Clisador, Fotograbador
835002|Foto-Impresor Planchas Impresion, Fotograbado
835003|Fotograbador En General
835004|Fotografo, Fotograb., Impresion O Reprod. En Offset
835005|Fotomecanico, Fotograbado En General
835006|Grabador, Fotograbado
835007|Graneador De Planchas Para Clises
835008|Huecograbadores
835009|Insolador De Fotograbado
835010|Montador De Clises Sobre Soporte
835011|Pasador, Imprenta
835012|Retocador De Negativos,Fotograbado
835013|Retocador De Planchas De Impresion,Fotograbado
835014|Tirador De Pruebas De Clises Grabados
835015|Transportador,Fotograbado
836001|Cosedor De Pleigos A Maquina, Encuadernacion
836002|Dorador A Mano,Encuadernacion
836003|Encolador,Encuadernacion
836004|Encuadernador
836005|Grabador A Mano O A Maquina,Encuadernacion
836006|Guillotinero, Encuadernacion
836007|Recortador, Encuadernacion
836008|Repujador O Grabador A Mano O A Maq,Encuadernacion
837001|Ampliador De Fotografias
837002|Conductor Maq De Revelar Y Secar Pelicula Cinematografica
837003|Copiador De Fotografias
837004|Fotografo-Ampliador
837005|Fotografo-Revelador
837006|Fotografo-Sacador De Copias
837007|Reductor De Fotografias
837008|Revelador De Peliculas Fotograficas
837009|Revelador De Radiografias
837010|Sacador De Copias De Fotografias
837011|Secador De Peliculas Cinematograficas
839001|Estampador Textiles Y Papeles Pintados Mediante Planchas
839002|Impresor A La Plancha,De Telas Y Papeles Pintados
839003|Impresor De Telas A Maquina
839004|Impresor,Sericigrafia
839005|Operador De Prensa Estampar En Relieve O Seco
839006|Picador De Estarcidores,Sericigrafia
839007|Preparador De Estarcidores,Sericigrafia
839008|Sericigrafo,Impresor
841001|Acordeonero,Constructor
841002|Afinador De Instrum. Musicales, Pianos, Organos, Acordeones
841003|Const Instrum Viento De Madera O De Metal
841004|Fabricantes De Instrumentos Music., Arpas, Guitarra, Viento
841005|Guitarrero, Fabricante De Instrumentos De Cuerda
841006|Organero,Constructor Y Afinador
841007|Violenero,Constructor Y Afinador
842001|Bruceros
842002|Confeccionador A Mano De Cepillo
842003|Confeccionador De Brochas
842004|Confeccionador De Pinceles Finos
842005|Confeccionador De Escobas A Mano
842006|Confeccionador De Esteras,Esterones
842007|Confeccionador De Muebles De Cana,Junco,Mimbre
842008|Confecc Alfombras Junco,Pita,Esparto,Fibra Coco
842009|Confeccionador A Maquina De Brochas Y Cepillos
842010|Confeccionador De Tapias De Junco Fino
842011|Cosedor De Escobas
842012|Escobero
842013|Esterero En Junco,Pita Y Fibra De Coco
842014|Tejedor De Capazos
842015|Tejedor De Capazos De Junco O Esparto
842016|Tejedor De Cestos
842017|Tejedor De Seras Y Serones
842018|Tejedor Muebles De Mimbre
842019|Trenzador De Cestas,De Sarrias
842020|Tejedores De Esteras Y Funcos
843001|Fabricante De Piezas En Hormigon Armado
843002|Fabricante De Productos De Asbestos-Cemento
843003|Fabricante De Productos De Piedra Artificial
843004|Obrero De La Elabor. De Prefabricados De Hormigon Armado
843005|Obrero De La Elaboracion De Prod.Hormigon Armado
843006|Obrero De La Elaboracion De Fibrocemento De Amianto
843007|Obrero De La Fabricacion De Piedra Artificial
843008|Obrero De La Fabric. De Aglomerados De Piedra Artificial
843009|Obrero De La Fabricacion De Papel Y Tela De Esmeril(Lija)
843010|Obrero De La Fab. De Telas Y Papeles Prevestidos
843011|Losetero Fabricacion De Locetas Y Mosaicos
843012|Obrero De La Preparacion De Arenas Siliceas Para Filtros
843013|Otros Obreros De La Fabricacion De Prod. Derivados
844001|Abaniquero,Confeccionador De Abanicos
844002|Candelero
844003|Cerero
844004|Confeccionador De Munecos Y Juguetes De Trapo
844005|Confeccionador De Sellos De Caucho
844006|Confeccionador De Velas Y Bujias
844007|Confeccionador De Pelucas
844008|Confecc.De Zapatos De Rafia Y Fibras Semejantes
844009|Confeccionador De Ojotas O Llanques
844010|Confeccionador De Felpudos De Jebe O Llanta
844011|Confeccionador De Artesania Con Fibra Acrilica
844012|Confeccionador De Postizos
844013|Confeccionador De Dientes Artificiales
844014|Confeccionador De Cierres
844015|Cortador De Corcho, Fabricacion De Articulos
844016|Grabador De Marfil, Hueso Y Plastico
844017|Grabador De Hierro, Marfil,Plastico O Hueso
844018|Obrero De Impermeabilizacion De Telas Al Aceite
844019|Obrero De La Elaboracion De Productos De Corcho
844020|Obrero De La Elaboracion De Cuerdas De Tripa
844021|Obrero De La Fabricacion De Linoleo
844022|Obrero De La Fabric.De Peliculas Y Papel Fotografico
844023|Obrero De La Fabricacion De Juguetes De Madera
844024|Obrero De Fabricacion De Juguete Metalicos
844025|Obrero De Trat. Y Revest. De Alquitran O Asfalto Del Papel
844026|Obrero En La Elaboracion De Telas Aceitadas
844027|Obrero En La Fabricacion De Botones
844028|Obrero En La Fabricacion De Adornos Artificiales
844029|Operador De Maquina De Fabricar Lapices
844030|Operador De Prensa De Fab. Tizas Blancas Y Color
844031|Preparador De Placas Fotograficas
844032|Maquinista En La Fabricacion De Cables
844033|Tejedor De Disfraces
851001|Barnizador, Construccion
851002|Decorador De Abordo, Barcos
851003|Encallador
851004|Pintor De Coches De Viajeros Y Vagones, Ferrocarriles
851005|Pintor De Construccion, Conservacion
851006|Pintor De Construc.Metalicas Y Cascos Y Buques
851007|Pintor De Construccion Escenicas,Cinematografia
851008|Barnizador,Construccion
851009|Pintor De Decorador De Fondo,Teatro,Cine
852001|Pintor A Pincel Y Rodillo,Excepto Edificio Y Construc.
852002|Pintor A Pistola,Excepto De Edif.Y Construcion
852003|Pintor De Automoviles
852004|Pintor De Letreros Y Rotulos
852005|Pintor De Rotulos
852006|Pintor Por Inmersion
852007|Pintor-Pulverizador,Fabricacion De Automoviles
852008|Pintor Retocador De Automov., Carroc. De Productos En Serie
852009|Reparacion De Automoviles,Pintor Retocador
852010|Retocador De Automoviles,Carroceria
852011|Barnizador,Excepto Construccion
852012|Laqueador,Excepto Construccion
861001|Adoquineros
861002|Adoquinador-Pavimentador
861003|Albañil
861004|Albañilero
861005|Albañil En General
861006|Colocacion De Losas,Suelo, Solador
861007|Colocador De Labrillos En General
861008|Constructor De Casas, Albanil
861009|Constructor De Alcantarillas, Albaðil
861010|Enlosador
861011|Estufista,Fumista Albaðil En La Industria
861012|Mampostero
861013|Marmolista, Construccion
861014|Mosaista,Colocador De Mosaicos
861015|Pavimentador
861016|Rejuntador De Mamposteria Careada Y Concertada
861017|Restaurador De Mamposteria De Construc.Historic.,Albaðil
861018|Solador En Mosaico
861019|Solador De Labrillos O Baldosas
861020|Solador En Materiales Plasticas, Sintasol
862001|Armador De Hormigon
862002|Carpintero De Arma, Trabajo De Encofrado
862003|Cementero De Hormigon Armado,En General
862004|Cementero,Trabajo De Acabado
862005|Encofrador En Madera
862006|Enfoscador
862007|En Terrazo
862008|Obrero Del Curado Del Hormigon
862009|Operador De Maq De Aire Comprim Para Revest. Con Hormigon
862010|Solador En Terrazo, Pavimento Continuo
862011|Vestimientos Con Hormigon
863001|Colocador De Cubiertas De Asfalto, De Junco De Metal
863002|Colocador De Tejas, Techador
863003|Otros Techadores
863004|Techador En General, Pizarra, Teja, Asfalto, Materiales Sin
863005|En Metal De Paja Y Similares
864001|Carpintero En Construc En Gral,Exc:Arma,Trab.De Encofrado
864002|Calafatero,Carpintero
864003|Carpintero-Ebanista De Construccion
864004|Carpintero De Aviacion
864005|Carpintero Ebanista, Construccion De Edificios
864006|Carpintero Ebanista, Construccion De Barcos
864007|Carpintero-Armador De Embarcaciones
864008|Carpintero Naval O Calafatero
864009|Carpintero De Rivera
864010|Carpintero De Puerta Y Ventanas
864011|Colocador De Parquet
864012|Entarugador De Pavimentos
864013|Montador De Ebanisteria, Edificacion
864014|Parquetero, Coloca Pisos De Parquet
864015|Portaventanero
865001|Decorador En Yeso Fibroso
865002|Enlistonador
865003|Enlucidor En Yeso, En General
865004|Escayolista-Decorador, Escayolista
865005|Estuquista-Decorador,Escoyolista
865006|Listonero
865007|Revocador
865008|Yesero En General
866001|Aislador De Edificio
866002|Aislador De Inst.De Refrig. Y De Climatizacion
866003|Aislador De Turbina
866004|Instalador De Mater.Aislante,En Edific,De Insonorizacion
866005|Sonidos;En Calderas Y Tuberias, De Aire Acondicionado
866006|Ionado, Equipos De Regrigeracion, Etc.
866007|Instalador De Material De Insonorizacion
866008|Otros Instaladores De Mater.Aislantes De Insonorizacion
867001|Cristalero De Edificio
867002|Cristalero De Claroboyas
867003|Colocador De Vidrios En Ventanas
867004|Colocador De Lunas De Vehiculos
867005|Vidriero, Colocador De Vidrios
868001|Asfalto, Grano De Arena Y Materiales Similares
868002|Buzo (Constr. Y Repara Cimiento De Los Puentes, Y Diques, M
868004|Colocador De Baldosas Sinteticas
868005|Colocador De Caðerias Principales De Agua
868006|Colocador De Cables Gruesos Subterraneos
868007|Colocador De Tubos, Conducciones
868008|Constructor De Canalizacion Por Tubos
868009|Maestro De Obras En General
868010|Montador De Andamios
868011|Montador De Elementos Prefabric.De La Edificac.
868012|Montador,Edificacion Con Elementos Prefabricado
868013|Obrero De Conservacion, Reparacion Y Mantenimiento De Edifi
868014|Obrero De Revest.De Suelos De Baldosas Sinteticas
868015|Obrero Especializado En Suelo Revestidos Con Asfalto
868016|Obrero Especializado En Apeos
868017|Pocero
868018|Reparador De Chimineas Y Torres
868019|Solador,Ladrillos Y Baldosas De Material Sintetico
868020|Trabajador En La Construccion Y Repaciones
871001|Cargas De Energia Electrica
871002|Dispatcher De Energia Electrica,Repartidor De Cargas
871003|Electrico,De Generador
871004|Operador De Central Termoelectrica E Hidroelectricas
871005|Operador De Cuadro De Distribucion De Control
871006|Operador De Equipo Electrogeno Particular
871007|Operador De Generador De Energia Electrica, Inst. Particula
871008|Operador De Instalacion De Central Termoelectrica E Hidroel
871009|Operador De Planta De Fuerza Energia Electrica
871010|Operador De Reactor Nuclear
871011|Operador De Turbina De Central Electrica, Planta De Fuerza
871012|Operador De Planta Termoelectrica E Hidroelectricas
871013|Otros Operadores De Instalaciones De Produccion De Energia
871014|Repartidor De Cargas,Energia Electrica
872001|Conductor - Chofer De Maquinaria Agricola
872002|Funigador - Conductor
872003|Operador De Maquinaria De Irrigacion Artificial
872004|Tractorista
872006|Operador - Cosechadora
873001|Conductor De Compresas De Aire, De Gas
873002|Conductor De Instalaciones Depuradora De Agua
873003|Fogonero De Caldera De Vapor, Excepto Fogonero De Barco O L
873004|Guarda De Prensa De Embalse
873005|Guarda De Valvulas De Desague, Embalse
873006|Operador De Compresor De Aire, De Gas
873007|Operador De Estacion De Bombeo
873008|Operador De Instalaciones De Bombeo,Exc Refino De Petroleo
873009|Operador De Instalaciones De Tratamiento Del Agua,Abastecim
873010|Operador De Instalaciones De Incineracion De Residuos
873011|Operador De Instalaciones De Refrigeracion
873012|Operador De Instalaciones De Calef.Y Ventilacion
873013|Operador De Maquinas Fijas N.E.O.P
873014|Otros Operador De Maquinas Fijas Y De Instalaciones Similar
873015|Vigilantes De Compuertas,Servicios De Agua
873016|Maquinistas De Maquinas Fijas N.E.O.P
874001|Aparejador De Aparatos De Elevacion
874002|Aparejador De Barcos
874003|Aparejador De Aviones
874004|Aparejador, Fondeos De Petroleo Y De Gas
874005|Aparejador, Perforacion De Pozos De Petrol.Y Gas
874006|Aparejador, Sondeos De Petroleo Y De Gas
874007|Empalmador De Cuerdas Y Cables En Gral, En Excepto Electric
874008|Empalmador De Estrobos
874009|Montador De Aparatos De Elevacion(Funicular)
874010|Montador De Cables De Aviacion
874011|Montador De Cables,Perfor.De Pozos De Petr.Gas
874012|Montador De Cables De Puentes Colgantes
874013|Montador De Cables De Guaros Aereos
874014|Montador De Cables De Transporte Aereo
874015|Otros Aparejadores Y Empalmadores De Cables,Excepto De Tele
875001|Conductor De Grua Apiladora
875002|Conductor De Grua Fija
875003|Conductor De Grua Movil
875004|Conductor De Grua Locomovil
875005|Conductor De Grua Flotante
875006|Conductor De Grua Sobre Plataforma Movil.Ferrc.
875007|Conductor De Jaulas,Minas
875008|Chofer De Montacargas(Construccion)
875009|Conductor De Puente Grua O Grua De Portico
875010|Conductor De Torre Grua
875011|Conductor De Grua,Sobre Vagon De Ferrocarriles
875012|Gruista,Conductor De Grua De Portico O Pte Grua
875013|Maquinista De Torre Grua
875014|Maquinista De Extraccion,Minas
875015|Maquinistas De Puente Giratorio
875016|Operador De Cabrestante
875017|Operador De Grua De Cubierta
875018|Operador De Montacargas,Construccion
875019|Operador De Ponton De Grua
875020|Operador De Puente Levadizo
875021|Operador De Puente Giratorio
875022|Operador De Torno De Vapor, Cabrestante
875023|Operador De Cabrestante De Vapor
875024|Conductores De Gruas Y Operadores De Instalaciones De Eleva
875025|Maniobrista De Muelle
876001|Conductor De Aplanadora De Caminos
876002|Conductor De Apisonadora
876003|Conductor De Asfaltadora
876004|Conductor De Alquitranadora Asfaltadora
876005|Conductor De Atacador Mecanico Construccion
876006|Conductor De Bulldozer
876007|Conductor De Cangilon De Arrastre
876008|Conductor De Dragalina
876009|Conductor De Draga
876010|Conductor De Excavadora
876011|Conductor De Explanadora Y De Escraper
876012|Conductor De Esparcidora Acabadora Para Camino
876013|Conductor De Hormigonera
876014|Conductor De Instalacion Distribuidora Para La Preparacion
876015|Conductor De Maquinas De Abrir Zanjas
876016|Conductor De Maquinas De Excavar Zanjas
876017|Conductor De Martinete
876018|Conductor De Maquina Hincadora De Pilotes
876019|Conductor De Maquina De Abrir Tuneles
876020|Conductor De Maquina De Abrir Hoyos
876021|Conductor De Niveladora Con Cuchilla Frontal,Bulldozer
876022|Conductor De Niveladora Y Escraper
876023|Conductor De Pala Mecanica
876024|Conductor De Pavimentadora En Hormigon
876025|Conductor De Perforad.De Aire Comprimido,Const.
876026|Operador De Instalciones Para Mezclar Hormigon
876027|Operador De Zanjadora De Cangilones
876028|Otros Conductores De Maquina Para El Movimiento De Tierras
876029|Picador Con Martillo Neumatico, Construccion
877001|Conductor De Carretilla Elevadora
877002|Conductor De Carreton De Horquilla Elevadora
877003|Conductor De Camion Volquete
877004|Conductor De Carreta De Transporte Troncos, Rollizos Y Fust
877005|Conductor De Cinta Transportadora
877006|Conductor De Elevador  De Carga
877007|Conductor De Vagonera Lanzadera,Minas
877008|Obreros De La Manipulacion De Mercancia Y Materiales O De M
877009|Chofer De Montacargas(Excepto Construccion)
877010|Elevadorista De Carga
877011|Volquetero
881001|Balseros
881002|Contramaestre De Barco
881003|Grumete
881004|Lanchero
881005|Marinero En Gral, De Primera,Sgda,De Remolcador De Yate,De
881006|Panolero De Cubierta
881007|Timonel De Barco
881008|Maniobrista De Barco
881009|Marinero(Marinero Mercante)
881010|Vaporino
882001|Auxiliar De La Camara De Maquinas,Barcos
882002|Engrasador De Barcos
882003|Fogonero De Barco
882004|Limpiador De Maquinas.Barcos
882005|Mecanicos Engrasador,Barcos
883001|Ayudante De Maquinistas De Tren
883002|Conductor De Locomotora En Minas Y Canteras
883003|Conductor De Locomotoras De Maniobras
883004|Fogonero De Locomotora De Vapor
883005|Maquinista De Tren O Locomotora
883006|Maquinista De Tren De Mina O Cantera
884001|Agentes De Maniobras
884002|Brequero De Ferrocarril
884003|Clasificador De Trenes
884004|Conductor,Agente De Maniobras
884005|Derivador, Ferrocarriles
884006|Enganchador De Vagones,Ferrocarriles
884007|Guardafrenos,Tren De Mercancia
884008|Guardagujas/Controlador De Trafico Ferroviario
884009|Guardagujas-Enganchador,(Minas Y Canteras)
884010|Jefe De Tren De Mercancias
885001|Chofer De Taxi
885002|Chofer De Entrega De Coches Nuevos
885003|Chofer Particular
885004|Conductor De Motocicleta
885005|Conductor De Autobus, Automovil, Camioneta, Camion O Furgon
885006|Microbusero/Conductor De Microbus
885007|Taxista
885008|Conductores De Camiones Pesados
886001|Guarda Barrera,Ferrocarriles
886002|Guarda De Esclusa,Canales O Puertos
886003|Jefe De Dique O Varadero
886004|Jefe De Puerto.Dique Seco
886005|Obrero De Compuertas De Evacuacion,Exclusas En Dique Seco
886006|Patron De Puerto,Dique Seco
886007|Torrero De Faro,Aeropuerto Y Puertos
911001|Vendedor Ambulante, Cereales: Avena, Cebada, Trigo, Etc.
911002|Vendedor Ambulante, Especerias: Canela, Clavo De Olor, Pimi
911003|Vendedor Ambulante, Fruta Fresca
911004|Vendedor Ambulante, Hortalizas: Ajo, Cebolla, Choclo, Vaini
911005|Vendedor Ambulante, Menestras: Frijoles, Garbanzos, Lenteja
911006|Vendedor Ambulante, Tuberculos: Camote, Papa, Yuca, Etc.
912001|Vendedor Ambulante, Anticuchos
912002|Vendedor Ambulante, Cebiches Y Derivados
912003|Vendedor Ambulante, Churros
912004|Vendedor Ambulante, Emoliente
912005|Vendedor Ambulante, Jugos Y Refrescos
912006|Vendedor Ambulante, Picantes
912007|Vendedor Ambulante, Raspadillas
912008|Vendedor Ambulante, Salchipapas
912009|Vendedor Ambulante, Sandwich
912010|Vendedor Ambulante, Comidas Preparadas En La Calle, Otros
913001|Vendedor Ambulante, Alfalfa Y Forraje
913002|Vendedor Ambulante, Coca
913003|Vendedor Ambulante, Flores
913004|Vendedor Ambulante, Plantas Y Semillas
913005|Vendedor Ambulante, Cochinilla
914001|Vendedor Ambulante, Camarones Y Langostinos
914002|Vendedor Ambulante, Carne De: Ballena, Lobo Marino, Tortuga
914003|Vendedor Ambulante, Mariscos: Choros, Conchas, Etc.
914004|Vendedor Ambulante, Pescados: Bonito, Jurel, Pejerrey, Truc
915001|Vendedor Ambulante, Animales Vivos: Conejos, Gatos, Perros,
915002|Vendedor Ambulante, Aves Vivos Y/O Sus Carnes
915003|Vendedor Ambulante, Carnes: Porcino, Vacuno, Etc.
915004|Vendedor Ambulante, Repartidor De Leche
916001|Vendedor Ambulante, Productos Farmaceuticos: Alcohol, Algod
916002|Vendedor Ambulante, Cortezas Y Hierbas/ Uso Medicinal
916003|Vendedor Ambulante, Raices De Plantas/ Uso Medicinal
917001|Vendedor Ambulante, Aceite Comestible
917002|Vendedor Ambulante, Cafe Tostado, Molido, Envasado Y/O Gran
917003|Vendedor Ambulante, Caramelos, Confites, Chocolates, Gallet
917004|Vendedor Ambulante, Helados, Hielo, Marcianos, Etc.
917005|Vendedor Ambulante, Pan, Pasteles
917006|Vendedor Ambulante, Productos Lacteos, Fideos, Harinas, Azu
917007|Vendedor Ambulante, Productos Alimenticios Para Animales/ A
917008|Vendedor Ambulante, Abarrotes
918001|Vendedor Ambulante, Cigarro, Tabaco, Pipas E Implementos Pa
918002|Vendedor Ambulante, Agua Mineral, Gaseosas, Vino, Etc.
919001|Vendedor Ambulante; Cosmeticos, Perfumes, Locion, Etc.
919002|Vendedor Ambulante; Escobas, Escobillas, Escobillones, Etc.
919003|Vendedor Ambulante; Jabones, Detergentes, Etc.
919004|Vendedor Ambulante; Pasta Dentrifica, Papel Higienico, Etc.
919005|Vendedor Ambulante; Productos De: Ornella, Unique, Yambal,
921001|Vendedor Ambulante; Aceite Para Autos, Lubricantes (Envasad
921002|Vendedor Ambulante; Gas / Repartidor En Camioneta O Tricicl
921003|Vendedor Ambulante, Leða O Carbon
922001|Vendedor Ambulante, Calzados, Zapatillas, Sandalias, Slaps,
922002|Vendedor Ambulante, Merceria: Agujas, Adornos De Vestido, B
922003|Vendedor Ambulante, Prendas De Vestir: Camisas, Carteras, P
922004|Vendedor Ambulante, Telas Y/O Tejidos
922005|Vendedor Ambulante, Sombreros
922006|Vendedor Ambulante Pasamaneria, Lenceria, Merceria
923001|Vendedor Ambulante, Alfombras. Cortinas, Tapices Y Articulo
923002|Vendedor Ambulante, Art. Domest.: Cocina, Lavadora, Refrige
923003|Vendedor Ambulante, Catres Y Colchones/ Camas
923004|Vendedor Ambulante, Muebles Para El Hogar
923005|Vendedor Ambulante, Utensilios De Cocina: Cacerolas, Cuchil
923006|Vendedor Ambulante, Art. De Mesa: Manteles, Individuales, P
924001|Vendedor Ambulante, Diarios Y Revistas / Canillitas
924002|Vendedor Ambulante, Libros Y Novelas
924003|Vendedor Ambulante, Utles De Escritorio: Borradores, Cuader
925001|Vendedor Ambulante, Antiguedades
925002|Vendedor Ambulante, Articulos Artesanales
925003|Vendedor Ambulante, Articulos De Plata
925004|Vendedor Ambulante, Articulos Religiosos
925005|Vendedor Ambulante, Articulos Para Fiestas Y Disfraces
925006|Vendedor Ambulante, Cuadros Y Esculturas
926001|Vendedor Ambulante, Articulos Deportivos
926002|Vendedor Ambulante, Juguetes
927001|Vendedor Ambulante, Anteojos Y Lunas
927002|Vendedor Ambulante, Cassettes (Blancos Y Grabados) Y Discos
927003|Vendedor Ambulante, Hules Y/O Marroquines
927004|Vendedor Ambulante, Maletas Y Maletines / Carteras
927005|Vendedor Ambulante, Relojes
927006|Vendedor Ambulante, Repuesto Y/O Art. De Ferreteria
927007|Vendedor Ambulante, Otros
931001|Cobrador, Autobuses Y Microbuses
931002|Cobrador, Pasaje/ Microbus Y Omnibus
931003|Cobrador, Pasaje/ Camioneta Rural (Combi)
931004|Cobrador, Pasaje/ Ferrocarril
931005|Cobrador, Transporte Por Carretera
931006|Vendedor De Boletos, Camioneta Rural, Microbuses, Omnibus,
931007|Vendedor De Boletos Y Pasajes De Viaje Aereo
941001|Ama De Cria O Seca O Leche O Niðos
941002|Ama De Llaves
941003|Aya Mama
941004|Ayuda De Camara
941005|Cantinero
941006|Camarero
941007|Cocinero
941008|Criado
941009|Dama De Compaðia
941011|Lavandero
941014|Mesero
941015|Mozo (Personal Domestico)
941016|Mucama
941017|Nana
941018|Niñera
941019|Sirvienta (E)
941020|Sirvienta (E), Cocina
941021|Sirvienta (E), Salon
941022|Sirviente (A), Cocina
941023|Sirviente (A), Salon
942001|Almidonador, Lavanderia
942002|Camarero, Hoteleria
942003|Clasificador, Ropa/Lavanderia
942004|Lavandero, A Mano/Lavanderia
942005|Lavapisos
942006|Lavaplatos De: Cantina, Hotel, Restaurante
942007|Limpiador, En Seco/A Mano
942008|Limpiador De: Fabricas, Hoteles, Oficinas Y Restaurantes
942009|Mujer De Limpieza De: Hoteles, Oficinas Etc.
942010|Peon De Limpieza De: Aeronaves, Autobuses, Fabricas Etc.
942011|Planchador, A Mano
942012|Quitamanchas, A Mano
943001|Bedel
943002|Conserje
943003|Conserje, Edificio/Apartamentos
943004|Empleado, Edificio/Apartamentos(Limpieza)
943005|Encargado, Inmueble
943006|Guardian, Edificio
943007|Portero-Cuidador
943008|Portero-Cuidador, Establecimiento Religioso
943009|Sacristan
944001|Lavador Ambulante De Autos
944002|Limpiabotas
944003|Limpiador De Ventanas
944004|Lustrabotas
944005|Pegador De Carteles
944006|Recadero
945001|Acomodador, Sala, Cine, Teatro Etc.
945002|Anotador De Apuestas
945003|Armador De Cajas De Carton A Mano
945004|Ayudante De Camion
945005|Ayudante, Baðos Turcos
945006|Ayudante, Baðos Sauna
945008|Cartonero A Mano
945009|Comprador, Vendedor Ambulante De Monedas Y Billetes
945010|Decorador De Iglesias
945011|Descargador De Aviones
945012|Descargador De Barcos
945013|Embalador A Mano Y/O Maquina
945014|Empaquetador A Mano Y/O Maquina
945015|Ensacador A Mano
945016|Escogedor De Botellas
945017|Envasador A Mano O Y/O Maquina
945018|Estibador Cargador De Barcos
945019|Fotografo Ambulante
945020|Jardinero
945021|Llenado O Envasador De Productos
945022|Mecanografos Ambulantes
945023|Meretrices, Prostitutas, Copetineras
945024|Mozo De Mudanza
945025|Mozo De Mercados De Abastos
945026|Mozo De Transporte De Muebles
945027|Mozo De Almacen
945028|Mozo De Cuerda, Excepto En Los Hoteles
945029|Mozo De Equipajes, Excepto En Los Hoteles
945031|Obrero Portuario
945032|Pareja De Baile
945033|Pelador De Pollos, Gallinas Y Otras Aves
945034|Pintor De Bandas Sobre Calles Y Caminos
945035|Promotores De Juego En La Calle (Ajedrez, Damas, Etc.)
945036|Recepcionista-Acompañante, Cabaret, Club Etc.
945037|Recogedor De Pelotas
945038|Servicio De Alquiler De Vehiculos
945039|Servicio De Alquiler De Videos, Equipos De Sonido
945040|Tinterillero
945041|Trabajador En Ferias Y Parques Mecanicos De Diversiones
945042|Trabajador De Casino, Pin-Ball, Bowling, Bingo Y Salas De J
945043|Tramitador Ambulante
945044|Vendedores Por Telefono
945045|Cobrador De Autos
945046|Zapatero Remendon (Ambulante)
945047|Cuidado De Niðos En Viviendas Particulares
951001|Asensorista
951002|Botones
951003|Caddie, O Porteador De Palos De Golf
951004|Maletero, Hotel
951005|Mandadero
951006|Mensajero
951007|Mensajero, Telegramas
951008|Mozo De Cuerda
951009|Repartidor
951010|Repartidor, Diarios
951011|Repartidor, Periodicos
952001|Acomodador
952002|Conserje, Hotel
952003|Encargado, Local De Aseo
952004|Guardian
952005|Guardian, Estacionamiento
952006|Guardian, Feria
952007|Guardian, Galeria De Arte
952008|Guardian, Guardarropa
952009|Guardian, Museo
952010|Guardian, Parque De Atracciones
952011|Guardian, Parques Y Jardines Publicos
952012|Guardian, Salon De Descanso
952013|Guardian, Vestuario
952014|Portero
952015|Portero, Hotel
952016|Portero, Hotel/Vestibulo De Recepcion
952017|Sereno
952018|Ujier
952019|Vigilante
952020|Vigilante, Horarios De Trabajo
952021|Vigilante, Museo
952022|Vigilante, Nocturno
953001|Lector De Medidores
961001|Basurero
961002|Barrendero
961003|Barrendero, Calles
961004|Barrendero, Fabricas
961005|Barrendero, Plazas Y Parques/Jardines
961006|Peon Carbonero
961007|Peon General
961008|Peon, Recoleccion De Desechos
961009|Recogedor, Basuras/Camion O Triciclo
971001|Agricultor, Ayudante
971002|Apanador/Cosechador De Algodon
971003|Arboricultor
971004|Arriero
971005|Boyero
971006|Bracero Agricola
971007|Caballerizo (Obrero)
971008|Campesino
971009|Capador (Obrero)
971010|Conductor, Bovinos
971011|Cortador De Caða De Azucar
971012|Cosechador: Mani, Algodon, Pajas, Etc.
971013|Criador De Ranas, Pajaros (Obrero)
971014|Criador De Gusanos De Seda (Obrero)
971015|Cultivador: Algodon, Caða, Azucar, Etc.
971016|Dimidor
971017|Enganchador Agricola
971018|Esquilador (Obrero)
971019|Establero, Caballos Reproductores
971020|Gaðan
971021|Golondrino
971022|Injertador De Arboles Frutales (Obrero)
971023|Inseminador (Obrero)
971024|Jardinero (Obrero)
971025|Jornalero Agricola
971026|Leñador
971027|Marronero (Obrero)
971028|Mozo De Cuadra (Obrero)
971029|Obrero Ganadero, Ayudante
971030|Obrero Criador, Ayudante
971031|Obrero Avicultor, Ayudante
971032|Obrero Agricola De Arboles Frutales
971033|Obrero Agricola, Ayudante
971034|Obrero Forestal, Ayudante
971035|Palmero, Obrero Agricola
971036|Pastor Mochilero
971037|Peon Agropecuario
971038|Peon Agropecuario, Animales De Peleteria
971039|Peon Agropecuario, Cria De Animales De Piel
971040|Peon Agricola, Papero
971041|Peon Agricola, Hortalizas
971042|Peon Agricola, Cosechador/Frutas
971043|Peon Agricola, Cosechador/Te
971044|Peon Agricola, Cultivo Extensivo
971045|Peon Agropecuario, Estacional
971046|Peon Agropecuario, Ganado
971047|Peon Agropecuario, Temporero
971048|Peon De Estancia O Hacienda
971049|Peon De Labranza, Arboricultor
971050|Peon Agropecuario, Ordeðador/Ganado Lechero
971051|Peon Agropecuario, Migrante
971052|Peon Agropecuario, Ganado Equino
971053|Peon Agropecuario, Gusanos De Seda
971054|Peon Agricola, Cosechador/Algodon
971055|Peon Agricola En General
971056|Peon De Labranza, Cosechador/Frutos
971057|Peon De Labranza, Cosechador/Huertos
971058|Peon De Labranza, Cosechador/Algodon
971059|Peon De Labranza, Cosechador
971060|Peon De Labranza, Citricos
971061|Peon De Labranza, Cosechador/Te
971062|Peon De Labranza, Cria De Ganado
971063|Peon De Labranza, Ganado Ovino
971064|Peon De Labranza, Ganado Bovino
971065|Peon De Labranza, Ganado
971066|Peon De Labranza, Cultivo Extensivo
971067|Peon De Labranza
971068|Porquerizo
971069|Recogedor De Frutas (Obrero)
971070|Recolector De Miel
971071|Recolector De Frutos, Hojas De Te, Cafe, Etc.
971072|Resinero (Obrero)
971073|Rezador
971074|Tornero
971075|Trabajador Agricola
971076|Tropero
971077|Vareador
971078|Vigilante De Monte
972001|Descuajador
972002|Peon Forestal
973001|Batidor De Caza
973002|Encebador, Caza Con Trampa
973003|Peon Cazador
973004|Peon Trampero
973005|Rastrillador, Playas
973006|Pescador Artesanal
981001|Ahoyador, Canteras
981002|Peón, Lavador De Oro
981003|Peón, Lavador De Minerales
981004|Minero En General
981005|Obrero De Mineria De Lavado
981006|Pedrero
981007|Peon, Suministro De Electricidad, Gas Y Agua
981008|Peon, Minas O Canteras
981009|Peon, Canteras
981010|Picador, Minas
981011|Picapedrero
982001|Cavador, Zanjas Y Acequias
982002|Desbrozador De Tierra
982003|Limpiabarros
982004|Obreros Del Balasto, Ferrocarril
982005|Peon Bracero
982006|Peon Caminero
982007|Peon Cavador, Fosos
982008|Peon Cavador, Pozos De Agua
982009|Peon Cavador, Sepulturas, Sepulturero, Enterrador
982010|Peon Ferrocarrillero, Balasto
982011|Peon Construccion
982012|Peon Construccion/Carreteras
982013|Peon Construccion/Diques
982014|Peon, De Brega
982015|Peon, De Brigada Ferrocarriles
982016|Peon En General
982017|Portamiras, Topografia
982018|Vaciador De Pozos  Negros
983001|Apilador De Material, Construccion/Edificios, A Mano
983002|Empapelador De Paredes
983003|Peon, Albaðileria Y Ayudante De Albaðil
983004|Peon, Demolicion
983005|Peon, Tareas Diversas
984001|Cosedor A Mano, Encuadernacion
984002|Descabezados De Pescado
984003|Embalador, A Mano
984004|Embalador, A Mano/Cajas
984005|Embalador, Industria Conservera/Enlatado
984006|Embotellador Manual
984007|Empaquetador, Manual
984008|Ensacador, A Mano
984009|Envasador, A Mano
984010|Escamador De Pescado
984011|Etiquetador, A Mano
984012|Lavador, Articulos Textiles/A Mano
984013|Lavador, Cueros Y Pieles/A Mano
984014|Lavador, Reses/Carniceria(A Mano)
984015|Lavador, Taller De Fabricacion/A Mano
984016|Peon, Armado
984017|Peon, Clasificacion/Botellas
984018|Peón, Limpiador De Pescado
984019|Peon, Enrollador De Bobinas/A Mano
984020|Peon, Enrollador De Filamentos/A Mano
984021|Peon, Enrollador De Resortes/A Mano
984022|Peon, Industria Vinicola
984023|Peon, Industrias Manufactureras
984024|Peon, Operaciones De Montaje Manual
985001|Carretillero, Cargador Ambulante De Mercancias
985002|Conductor, Bicicleta
985003|Conductor, Carro De Mano
985004|Conductor, Silla De Manos
985005|Conductor, Triciclo/No Motorizado
985006|Conductor, Vehiculo A Pedales
985007|Conductor, Velocipedo De Transporte
986001|Arriero, Conductor De Vehiculos De Traccion Animal
986002|Burrero, Transporte
986003|Caballista, Arrastre De Vazonetas En Minas Y Canteras
986004|Caravanero
986005|Carretero, Conductor De Vehiculos De Traccion
986006|Cochero De Punto
986007|Conductor, Animales/Canteras, Carreteras
986008|Conductor, Animales/Minas
986009|Conductor De Animales De Carga
986010|Conductor, Maquinaria Agricola/No Motorizada
986011|Conductor, Mulas, Asemileros; Mulero, Transportes
986012|Conductor, Recuas
986013|Conductor, Vehiculo De Traccion Animal/Canteras
986014|Conductor, Vehiculo De Traccion Animal/Carreteras
986015|Conductor, Vehiculo De Traccion Animal/Minas
986016|Yuguero De Bueyes
986017|Yuguero De Mulas
986018|Yuguero De Mulas Y Bueyes
986019|Yuntero De Mulas Y Bueyes
987001|Cargador
987002|Cargador De Bultos
987003|Cargador, Buques
987004|Cargador, Buques Cisterna/Gases
987005|Cargador, Buques Cisterna/Liquido
987006|Cargador, Camiones
987007|Cargador, Muebles
987008|Cargador, Vehiculos/Transporte Ferroviario
987009|Cargador, Vehiculos/Transporte Por Carretera
987010|Estibador, Manual
987011|Manipulador, Almacenes Frigorificos
987012|Manipulador, Carga
987013|Manipulador, Carne
987014|Manipulador, Fruta
987015|Manipulador, Grandes Almacenes
987016|Manipulador, Mercado De Alimentos
987017|Manipulador, Mercancias
987018|Manipulador, Pescado
987019|Manipulador, Tienda
987020|Peon De Carga, Aviones
987021|Peon De Carga, Buques
987022|Peon De Carga, Buques Cisterna/Gases
987023|Peon De Carga, Buques Cisterna/Liquidos
987024|Peon De Carga, Empresas De Mudanzas
987025|Peon Portuario
999001|Ocupación No Especificada.
`;

/** Todas las ocupaciones: código de 6 dígitos y descripción. */
export const OCCUPATIONS: { code: string; name: string }[] = DATA
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const i = line.indexOf("|");
    return { code: line.slice(0, i), name: line.slice(i + 1) };
  });

const BY_CODE = new Map(OCCUPATIONS.map((o) => [o.code, o.name]));

/** Descripción de una ocupación por su código (o `undefined` si no existe). */
export function occupationName(code: string | undefined | null): string | undefined {
  return code ? BY_CODE.get(code) : undefined;
}

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const SEARCH = OCCUPATIONS.map((o) => ({ ...o, key: norm(`${o.code} ${o.name}`) }));

/**
 * Busca ocupaciones por código o por texto de la descripción (ignora tildes y
 * mayúsculas). Sin texto devuelve las primeras `limit` para poblar la lista.
 */
export function searchOccupations(query: string, limit = 50): { code: string; name: string }[] {
  const q = norm(query.trim());
  if (!q) return OCCUPATIONS.slice(0, limit);
  const out: { code: string; name: string }[] = [];
  for (const o of SEARCH) {
    if (o.key.includes(q)) {
      out.push({ code: o.code, name: o.name });
      if (out.length >= limit) break;
    }
  }
  return out;
}
