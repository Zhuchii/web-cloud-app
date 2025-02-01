let toggle = document.getElementById("toggle");
let sign = document.getElementById("sign");
let login = document.getElementById("login");

function toggle_animation(){
    if (control==0){
    var tl = new TimelineLite();
    tl.to(".toggleTittle", 0.5,{
        filter: "blur(100px)",
    }, "-=0.5");
    tl.to(toggle, 0.5,{
        transform: "translateX(-90%)",
        borderRadius: "30px 100px 100px 30px",
    });
    tl.to(sign, 0.5,{
        transform: "translateX(110%)",
        zIndex: 2,
    }, "-=0.5");
    tl.to(login, 0.5,{
        transform: "translateX(110%)",
        zIndex: 1,
    }, "-=0.5");
    tl.to(".toggleTittle", 0.5,{
        filter: "blur(0px)",
        innerText: "Regístrate gratis y accede a todas nuestras funciones exclusivas.",
    }, "-=0.5");
    tl.to(".toggleA", 0.5,{
        innerText: "Ya tiene una cuenta? Inicie Sesion",
    }, "-=0.5");
    tl.to(".Switch", 0.5,{
        innerText: "Iniciar Sesion",
    }, "-=0.5");
}
else{
    var tl = new TimelineLite();
    tl.to(".toggleTittle", 0.5,{
        filter: "blur(100px)",
    }, "-=0.5");
    tl.to(toggle, 0.5,{
        transform: "translateX(0)",
        borderRadius: "100px 30px 30px 100px",
    });
    tl.to(sign, 0.5,{
        transform: "translateX(0)",
        zIndex: 1,
    }, "-=0.5");
    tl.to(login, 0.5,{
        transform: "translateX(0)",
        zIndex: 2,
    }, "-=0.5");
    tl.to(".toggleTittle", 0.5,{
        filter: "blur(0)",
        innerText: "Listo para llevar tus habilidades al siguiente nivel?",
    }, "-=0.5");
    tl.to(".toggleA", 0.5,{
        innerText: "¿No tiene una cuente? Cree una",
    }, "-=0.5");
    tl.to(".Switch", 0.5,{
        innerText: "Crear Cuenta",
    }, "-=0.5");
}
}

function validarFormulario_login() {
    var contrasena = (document.getElementById('contra')).value;
    var correo = (document.getElementById("usuario")).value;
    var spam = document.getElementById("login_comment");
    if (contrasena == "") {
        spam.innerText = "El campo contraseña no puede estar vacio"
        return false;
    }
    else if(correo == ""){
        spam.innerText = "El campo usuario no puede estar vacio"
        return false;
    }
    return true;
}

function validarFormulario_signup() {
    var usuario = (document.getElementById("usuario_sign")).value;
    var contrasena = (document.getElementById('contra_sign')).value;
    var correo = (document.getElementById("correo_sign")).value;
    var spam = document.getElementById("signup_comment");
    if (contrasena == "") {
        spam.innerText = "El campo contraseña no puede estar vacio"
        return false;
    }
    else if(correo == ""){
        spam.innerText = "El campo correo no puede estar vacio"
        return false;
    }
    else if(usuario == ""){
        spam.innerText = "El campo usuario no puede estar vacio"
        return false;
    }
    return true;
}

function toggle_password(button) {
    var input = button.parentElement.querySelector("input");
    var icono = button.querySelector(".togglepassword");

    if (input.type === "password") {
        input.type = "text";
        icono.classList.remove("fa-eye-slash");
        icono.classList.add("fa-eye");
    } else {
        input.type = "password";
        icono.classList.remove("fa-eye");
        icono.classList.add("fa-eye-slash");
    }
}


