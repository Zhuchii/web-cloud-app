# web-cloud-app
Una app (aun en desarrollo) de almacenamiento en la nube creada con flask.
Este es un proyecto personal que comenze a hacer para aprender javascript y sumergirme un poco en el mundo del desarrollo web.

## ¿Como hacer que funcione?

### 1. config.json
Lo primero sera en el archivo config.json agregar las credenciales. 
En el apartado de email se encuentran cosas como smtp_server o smtp_user aqui estas dependeran de que mail estas usando pero por ejemplo si usas un mail de google quedaria asi:

```
{
    "email": {
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 465,
        "smtp_user": "ejemplo@gmail.com",
```

Para el parametro de smtp_password entra a este [enlace](https://myaccount.google.com/apppasswords) con la cuenta con la que vas a enviar el correo (Se necesita tener activada la verificaicon en 2 pasos para crear una app password).

Una vez consigas la app password solo la pones en el archivo config.json y listo.

Por ultimo solo queda añadir una secret_key (esta puede ser cualquiera aunque mientras mas segura mejor) y ya estaria el archivo config.json configurado

### 2. Dependencias
Para instalar dependencias solo ejecuta el siguiente comando desde el directorio de la app

```
pip install -r requirements.txt
```
Esto instalara todas las dependencias necesarias para el proyecto

### 3. Ejecucion
Para ejecutar la app puedes simplemente ejecutar el archivo de python
```
python3 app.py
```

O bien puedes usar gunicorn, para esto solo tendras que instalar guvicorn y ejecutarlo con los siguientes comandos
```
pip install gunicorn
guvicorn app:app
```
