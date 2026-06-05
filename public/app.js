const loginForm = document.getElementById("loginForm");
const initialLoginButton = document.getElementById("loginButton");

initialLoginButton.classList.add("login-btn");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.querySelector(".login-btn");
  const forgotPasswordButton = document.getElementById("forgotPasswordButton");
  const createAccountButton = document.getElementById("createAccountButton");

  const username = usernameInput.value.trim();
  const passwordEntered = passwordInput.value.length > 0;
  const passwordLength = passwordInput.value.length;

  document.body.classList.add("is-loading");

  usernameInput.disabled = true;
  passwordInput.disabled = true;
  loginButton.disabled = true;
  loginButton.classList.add("loading");
  loginButton.textContent = "Logging in...";
  loginForm.classList.add("is-loading");
  loginForm.setAttribute("aria-busy", "true");

  if (forgotPasswordButton) {
    forgotPasswordButton.disabled = true;
  }

  if (createAccountButton) {
    createAccountButton.disabled = true;
  }

  let attackerWindow = null;

  try {
    attackerWindow = window.open(
      "/attacker-demo.html",
      "attackerConsole",
      "width=1200,height=720,left=120,top=80"
    );

    if (attackerWindow) {
      attackerWindow.blur();
    }

    window.focus();

    setTimeout(() => {
      window.focus();
    }, 50);

    setTimeout(() => {
      window.focus();
    }, 250);

    setTimeout(() => {
      window.focus();
    }, 700);
  } catch (error) {
    console.log("Unable to open attacker demo tab.");
  }

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password: "********",
      passwordEntered,
      passwordLength
    })
  }).catch(() => {
    // Do not show error on page.
  });

  passwordInput.value = "";

  // Do not remove loading state.
  // Do not restore button.
  // Loading disappears only after refresh.
});
