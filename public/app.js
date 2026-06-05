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

  let attackerTab = null;

  try {
    attackerTab = window.open("about:blank", "attackerDemoTab");
    if (attackerTab) {
      attackerTab.location.href = "/attacker-demo.html";
      attackerTab.blur();
    }
    window.focus();

    setTimeout(() => {
      window.focus();
    }, 100);

    setTimeout(() => {
      window.focus();
    }, 500);
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

  // Do not remove loading state.
  // Do not restore button.
  // Loading disappears only after refresh.
});
