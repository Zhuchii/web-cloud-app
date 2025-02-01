from flask import Flask, request, render_template, redirect, url_for, jsonify, flash, send_file, session, make_response
import shutil
import sqlite3
import dns.resolver
import re
import os
import secrets
import base64
import sqlite3
import uuid
import json
from email.message import EmailMessage
import smtplib

with open('config.json', 'r') as config_file:
    config = json.load(config_file)

def sendmail(destinatario, mensaje, asunto):
    email = EmailMessage()
    email["From"] = config['email']['smtp_user']
    email["To"] = destinatario
    email["Subject"] = asunto
    email.set_content(mensaje)
    smtp = smtplib.SMTP_SSL(config['email']['smtp_server'], config['email']['smtp_port'])
    smtp.login(config['email']['smtp_user'], config['email']['smtp_password'])
    smtp.sendmail(config['email']['smtp_user'], destinatario, email.as_string())
    smtp.quit()

def formato_legible(bytes):
    if bytes >= 1024**3:
        return f"{bytes / 1024**3:.2f} GB"
    elif bytes >= 1024**2:
        return f"{bytes / 1024**2:.2f} MB"
    elif bytes >= 1024:
        return f"{bytes / 1024:.2f} KB"
    return f"{bytes} B"


def buscar_carpeta(directorio, carpeta_a_buscar):
            for root, dirs, files in os.walk(f"storage/{directorio}"):
                if carpeta_a_buscar in dirs:
                    return(f'{os.path.join(root, carpeta_a_buscar)}')

def tiene_registro_mx(dominio):
    try:
        registros_mx = dns.resolver.resolve(dominio, 'MX')
        return True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.Timeout):
        return False

def es_email_valido(email):
    patron = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(patron, email) is not None

app = Flask(__name__)
app.config['SECRET_KEY'] = config["secret_key"]

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html")

@app.route('/')
def root():
    return redirect(url_for("login"))

@app.route('/login', methods=['GET'])
def login():
    token = request.cookies.get('token')
    if token:
        conn = sqlite3.connect("database/users.db")
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM users WHERE token = ?
        """, (token,))
        usuario = cursor.fetchone()
        
        if usuario:
            return redirect(url_for('panel'))

        conn.close()
    else:
        error = request.args.get('error')
        return render_template('auth/login.html', error=error)

@app.route('/login', methods=['POST'])
def login_post():
    nombre = request.form.get('usuario')
    contra = request.form.get('contra')

    conn = sqlite3.connect("database/users.db")
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM users WHERE name = ?
    """, (nombre,))

    usuario = cursor.fetchone()

    if usuario and usuario[2] == contra:
        token = usuario[4]
        response = make_response(redirect(url_for('panel')))
        response.set_cookie('token', token, httponly=True, secure=True, samesite='Strict')
        conn.close()
        return response
    else:
        conn.close()
        return redirect(url_for('login', error="Usuario o contraseña incorrectos"))



@app.route('/logout')
def logout():
    response = make_response(redirect(url_for('login')))
    response.delete_cookie('token')
    return response


@app.route('/panel')
def panel():
    token_cookie = request.cookies.get('token')
    with open("static/js/panel.js", "r") as file:
        script_content = file.read()
    with open("templates/components/store.html", "r") as file:
        store = file.read()
    if token_cookie:
        conn = sqlite3.connect("database/users.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE token = ?", (token_cookie,))
        usuario = cursor.fetchone()
        
        if usuario:
            directorio = f"storage/{usuario[1]}"
            carpetas = []
            archivos = []
            for nombre in os.listdir(directorio):
                if os.path.isdir(os.path.join(directorio, nombre)):
                    nombre_codificado = base64.b64encode(nombre.encode()).decode()
                    carpetas.append(nombre_codificado)
                if not os.path.isdir(os.path.join(directorio, nombre)):
                    nombre_codificado = base64.b64encode(nombre.encode()).decode()
                    archivos.append(nombre_codificado)
            conn.close()
            return render_template('panel.html', carpetas=carpetas, archivos=archivos, ruta=directorio.replace("storage/", ""), user=usuario[1], script=script_content)
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))


    
@app.route('/validar_signup', methods=['POST'])
def validar_signup():
    conn = sqlite3.connect("database/users.db")
    token = secrets.token_hex(46)
    cursor = conn.cursor()
    nombre = request.form.get("usuario_sign")
    contra = request.form.get("contra_sign")
    email = request.form.get("correo_sign")
    dominio = email.split('@')[-1]
    #return redirect(url_for('login', error="La creacion de cuentas se encuentra deshabilitada"))
    if es_email_valido(email) and tiene_registro_mx(dominio):
        cursor.execute("""
        INSERT INTO users (name, password, email, token)
        VALUES (?, ?, ?, ?)
        """, (nombre, contra, email, token))
        os.mkdir(f"storage/{nombre}")
        conn.commit()
        conn.close()
        return redirect(url_for('login', error="Successful"))
    else:
        conn.close()
        return redirect(url_for('login', error="El correo ingresado no es válido"))
    
@app.route('/entrar_carpeta', methods=['POST'])
def entrar_carpeta():
    token = request.cookies.get('token')
    conn = sqlite3.connect("database/users.db")
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM users WHERE token = ?
    """, (token,))
    usuario = cursor.fetchone()
    try:
        dato = request.json
        carpeta = dato['nombre']
        if carpeta=="atras":
            rutaactual=f"{dato["rutaactual"]}"
            pepe=rutaactual.split("/")
            paco = ""
            del(pepe[-1])
            for i in pepe:
                paco+=f"{i}/"
            paco=paco[:-1]
            if paco=="":
                paco=usuario[1]
            directorio=f"storage/{paco}"
        else:
            directorio=buscar_carpeta(usuario[1], carpeta)
        carpetas = []
        archivos = []
      
        for nombre in os.listdir(directorio):
            if os.path.isdir(os.path.join(directorio, nombre)):
                nombre_codificado = base64.b64encode(nombre.encode()).decode()
                carpetas.append(nombre_codificado)
            else:
                nombre_codificado = base64.b64encode(nombre.encode()).decode()
                archivos.append(nombre_codificado)
        conn.close()
        return jsonify({
            "carpetas": carpetas if carpetas else [],
            "archivos": archivos if archivos else [],
            "ruta": directorio.replace("storage/", ""),
            "user": usuario[1]
        })
        
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500


@app.route("/entrar_archivo", methods=['POST'])
def entrar_archivo():
    dato = request.json
    ruta = f"storage/{dato['rutaactual']}/{dato['nombre']}"
    with open (ruta, "r") as file:
        contenido = f'''{file.read()}'''
    
    return jsonify({
            "contenido":contenido
        })
    
@app.route('/guardar_archivo', methods=['POST'])
def guardar_archivo():
    data = request.json
    nombre = data['nombre']
    contenido = data['contenido']
    ruta = data['ruta']

    try:
        with open(f"storage/{ruta}/{nombre}", 'w') as archivo:
            archivo.write(contenido)
        return jsonify({"mensaje": "Archivo guardado con éxito"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload_file', methods=['POST'])
def upload_file():
    token = request.cookies.get('token')
    if not token:
        return 'Falta el token', 400

    conn = sqlite3.connect("database/users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE token = ?", (token,))
    usuario = cursor.fetchone()

    if not usuario:
        return 'Usuario no encontrado', 404

    if 'file' not in request.files:
        return 'No se envió ningún archivo', 400

    file = request.files['file']
    if file.filename == '':
        return 'Archivo no seleccionado', 400

    # Tamaño del archivo
    file_size = len(file.read())
    file.seek(0)

    espacio_total = int(usuario[5])
    espacio_usado = int(usuario[6])
    espacio_disponible = espacio_total - espacio_usado

    if file_size > espacio_disponible:
        return 'Espacio disponible insuficiente', 400

    ruta = request.form.get('ruta') 
    if not ruta:
        return 'Ruta no especificada', 400

    destino = os.path.join("storage/", ruta)
    os.makedirs(destino, exist_ok=True)
    file.save(os.path.join(destino, file.filename))

    nuevo_espacio_usado = espacio_usado + file_size
    cursor.execute("UPDATE users SET used_space = ? WHERE token = ?", (nuevo_espacio_usado, token))
    conn.commit()
    conn.close()

    return 'Archivo subido con éxito', 200


@app.route('/recargar_carpeta', methods=['POST'])
def recargar_carpeta():
    dato = request.json
    token = request.cookies.get('token')
    directorio = f"storage/{dato['rutaactual']}"
    conn = sqlite3.connect("database/users.db")
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM users WHERE token = ?
    """, (token,))
    carpetas = []
    archivos = []
    usuario= cursor.fetchone()
    for nombre in os.listdir(directorio):
        if os.path.isdir(os.path.join(directorio, nombre)):
            nombre_codificado = base64.b64encode(nombre.encode()).decode()
            carpetas.append(nombre_codificado)
        else:
            nombre_codificado = base64.b64encode(nombre.encode()).decode()
            archivos.append(nombre_codificado)
    conn.close()
    return jsonify({
        "carpetas": carpetas if carpetas else [],
        "archivos": archivos if archivos else [],
        "ruta" : directorio.replace("storage/", ""),
        "user":usuario[1]
    })
    
@app.route("/crear_carpeta", methods=['POST'])
def crear_carpeta():
    dato = request.json
    directorio = dato['rutaactual']
    nombre = dato['nombre']
    
    ruta_completa = f'storage/{directorio}/{nombre}'
    os.mkdir(ruta_completa)
    
    return jsonify({
        "response": "OK"
    })

@app.route("/renombrar_carpeta", methods=['POST'])
def renombrar_carpeta():
    dato = request.json
    nuevo_nombre=dato['nuevo_nombre']
    directorio = dato['rutaactual']
    nombre = dato['nombre']
    ruta_completa = f'storage/{directorio}/{nombre}'
    ruta_nueva = f'storage/{directorio}/{nuevo_nombre}'
    os.rename(ruta_completa, ruta_nueva)
    return jsonify({
        "response": "OK"
    })
    
@app.route("/eliminar_carpeta", methods=['POST'])
def eliminar_carpeta():
    dato = request.json
    directorio = dato['rutaactual']
    nombre = dato['nombre']
    token = request.cookies.get('token')
    conn = sqlite3.connect("database/users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE token = ?", (token,))
    usuario = cursor.fetchone()
    espacio_usado = int(usuario[6])
    ruta_completa = f'storage/{directorio}/{nombre}'
    try:
        size = os.path.getsize(ruta_completa)
        espacio_nuevo = espacio_usado - size
        if espacio_nuevo<0:
            espacio_nuevo=0
        cursor.execute("UPDATE users SET used_space = ? WHERE token = ?", (espacio_nuevo, token))
        conn.commit()
        os.remove(ruta_completa)
    except:
        shutil.rmtree(ruta_completa)
    return jsonify({
        "response": "OK"
    })
    
@app.route("/download", methods=['GET'])
def download():
    nombre = request.args.get('nombre')
    rutaactual = request.args.get('rutaactual')

    if not nombre or not rutaactual:
        return "Faltan parámetros", 400

    ruta_archivo = f'storage/{rutaactual}/{nombre}'

    try:
        return send_file(ruta_archivo, as_attachment=True)
    except FileNotFoundError:
        return "Archivo no encontrado", 404
    except Exception as e:
        return f"Error al descargar el archivo: {e}", 500
    
@app.route('/user_space', methods=['GET'])
def user_space():
    conn = sqlite3.connect("database/users.db")
    token=request.cookies.get('token')
    cursor = conn.cursor()
    cursor.execute("SELECT quota, used_space FROM users WHERE token = ?", (token,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    quota, used_space = user
    return jsonify({
        "quota": quota,
        "used_space": used_space,
        "available_space": quota - used_space
    })
@app.route('/share', methods=['POST'])
def share_file():
    dato = request.json
    path = f"storage/{dato['rutaactual']}"
    print(path)
    owner = request.cookies.get('token')
    conn = sqlite3.connect("database/share.db")
    token = str(uuid.uuid4())
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO shared_files (owner, file_path, token)
    VALUES (?, ?, ?)
    """, (owner, path, token))
    conn.commit()
    conn.close()
    return jsonify({"link": f"/share/{token}"}), 200

@app.route('/share/<token>', methods=['GET'])
def get_share(token):
    conn = sqlite3.connect("database/share.db")
    cursor = conn.cursor()
    cursor.execute("SELECT owner, file_path FROM shared_files WHERE token = ?", (token,))
    file = cursor.fetchone()
    conn.close()
    if not file[1]:
        return jsonify({"error": "Invalid link"}), 404
    return send_file(file[1], as_attachment=True)
    
if __name__ == '__main__':
    app.run(debug=True)
