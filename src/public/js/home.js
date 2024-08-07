

document.addEventListener("DOMContentLoaded", function () {
  
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      const productId = thumbnail.closest(".card").id;
      const mainImage = document.querySelector(`#${productId} .main-image`);
      mainImage.src = thumbnail.src;
    });
  });

  const statusSpans = document.querySelectorAll(".status-span");
  statusSpans.forEach((span) => {
    const status = span.textContent.trim();
    if (status === "Disponible") {
      span.style.color = "green";
    } else {
      span.style.color = "red";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {




    button.addEventListener("click", (event) => {
      event.preventDefault();

      checkAuthStatus().then((isAuthenticated) => {
        if (!isAuthenticated) {
          let loginModalLabel = document.getElementById('loginModalLabel');
        loginModalLabel.innerHTML = 'Debes loguearte para utilizar el carrito';

          document.getElementById('btn-login').click();
          return; 
        }

        const cartIdElement = document.getElementById("cart_id");
        const cartId = cartIdElement ? cartIdElement.textContent.split(" ")[2] : null;

        const productContainer = event.target.closest(".card");
        const productNameElement = productContainer.querySelector(".prodName");
        const productName = productNameElement ? productNameElement.innerText : "Producto desconocido";

        const productId = event.target.getAttribute("data-product-id");

        fetch(`/api/carts/${cartId}/product/${productId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Error al agregar el producto al carrito");
          }
        })
        .then((result) => {
          Swal.fire({
            text: `${productName} agregado al carrito`,
            position: "top",
            icon: "success",
            title: "Éxito",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire({
            text: `No se pudo agregar el producto al carrito`,
            title: "Error",
            position: "top",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
        });
      });
    });
  });
});

function login(event) {
  event.preventDefault();
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  if (!email || !password) {
    alert("Email y contraseña son necesarios");
    return;
  }

  fetch("/sessions/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "success") {
        // logger.info("Login exitoso");
        window.location.reload();
      } else {
        alert(data.error || "Usuario o Contraseña no validados");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    });
}

function logout() {
  fetch("/sessions/logout", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = '/';
      } else {
        alert("Error logging out");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function register(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  fetch("/sessions/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        Swal.fire({
          text: `Usuario agregado correctamente`,
          position: "top",
          icon: "success",
          title: "Éxito",
          showConfirmButton: false,
          timer: 1500,
        });
        form.reset();
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function checkAuthStatus() {
  return fetch("/sessions/status", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
  .then((data) => {
    // console.log('data home.js L 183', data)
    let notMocking = document.getElementById("notMocking")
    notMocking = notMocking.innerText
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const btnCart = document.getElementById("btn-cart");
    const btnChat = document.getElementById("btn-chat");
    const btnRTP = document.getElementById("btn-rtp");
    const btnTickets = document.getElementById("btn-tickets");
    const addToCartButtons = document.getElementsByClassName('add-to-cart-btn')
    const owners = document.getElementsByClassName("owner")
    const username = data.username

    if (data.isAuthenticated) {
      btnLogin.classList.add("d-none");
      btnLogout.classList.remove("d-none");
      if (data.isAdmin) {
        btnRTP.classList.remove("d-none");
        btnCart.classList.add("d-none");
        btnChat.classList.add("d-none");
        btnTickets.classList.add("d-none");
        Array.from(addToCartButtons).forEach(button => {
          button.classList.add("d-none");
        });
      }else {

        if (data.isPremium) {
          btnRTP.classList.remove("d-none");
          btnCart.classList.remove("d-none");
          btnChat.classList.remove("d-none");
          btnTickets.classList.remove("d-none");
          Array.from(addToCartButtons).forEach((button,index) => {
          button.classList.remove("d-none");
            const owner = owners[index].innerText.trim();
          if (username === owner) {
            button.title = "No puedes agregar tus propios productos al carrito";
            button.disabled = true;
            button.classList.remove('btn-warning')
            button.classList.add('btn-danger')
          }
          });
        } else {

          btnChat.classList.remove("d-none");
          btnCart.classList.remove("d-none");
          btnTickets.classList.remove("d-none");
          btnRTP.classList.add("d-none");
          Array.from(addToCartButtons).forEach(button => {
            button.classList.remove("d-none");
            if (notMocking==='false') button.disabled=true
          });
        }
      }
      
      return true;
    } else {
      btnLogin.classList.remove("d-none");
      btnLogout.classList.add("d-none");
      btnCart.classList.add("d-none");
      btnChat.classList.add("d-none");
      btnTickets.classList.add("d-none");
      return false;
    }

  })
  .catch((error) => {
    console.error("Error:", error);
    return false;
  });
}

function redirectToCart() {
  const cartIdElement = document.getElementById("cart_id");
  const cartId = cartIdElement ? cartIdElement.textContent.split(" ")[2] : null;

  fetch("/carts", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const cid = cartId;
      window.location.href = `/carts/${cid}`;
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
    });
}


function redirectToTickets() {
  const cartIdElement = document.getElementById("cart_id");
  const cartId = cartIdElement ? cartIdElement.textContent.split(" ")[2] : null;

  if (!cartId) {
    console.error("No se pudo obtener el ID del carrito.");
    return;
  }

  fetch(`/carts`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    window.location.href = `/carts/${cartId}/tickets`;
  })
  .catch((error) => {
    console.error("Error en la solicitud:", error);
  });
}


document.querySelectorAll(".toggle-password-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const input = this.previousElementSibling;
    const icon = this.querySelector("i");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const restoreForm = document.getElementById('restoreForm');
if (restoreForm)
{  restoreForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const emailInput = restoreForm.querySelector('input[name="email"]');
    const email = emailInput.value.trim();

    if (!email) {
      Swal.fire({
        text: `Por favor, ingresa tu correo electrónico.`,
        title: "Oops...",
        position: "top",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
      });
      // alert('Por favor, ingresa tu correo electrónico.');
      return;
    }
    try {
      const response = await fetch('/mail/recoverpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          text: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
          position: "top",
          icon: "success",
          title: "Éxito",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          emailInput.value=""
          const myModal = document.getElementById('cierraModal');
          myModal.click();
          // const restoreModal = new bootstrap.Modal(document.getElementById('restoreModal'));
          // restoreModal.hide();
        });
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un problema al intentar enviar el correo de recuperación. Por favor, intenta de nuevo más tarde.',
        confirmButtonText: 'Aceptar'
      });
      // alert('Hubo un problema al intentar enviar el correo de recuperación. Por favor, intenta de nuevo más tarde.');
    }
  });}
});
