document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim(); // trim spaces here
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorElement = document.getElementById("registerError");

  errorElement.textContent = "";

  if (password !== confirmPassword) {
    errorElement.textContent = "Passwords do not match!";
    return;
  }

  if (!fullName) {
    errorElement.textContent = "Full Name is required!";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        password
      })
    });

    const result = await response.text();

    if (response.ok && result.toLowerCase().includes("success")) {
      alert("Registration successful!");
      window.location.href = "login.html";
    } else {
      errorElement.textContent = result || "Registration failed.";
    }
  } catch (err) {
    errorElement.textContent = "An error occurred during registration.";
    console.error(err);
  }
});
