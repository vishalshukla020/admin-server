const validateRegisterInput = (username, phone, password) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "username must not be empty";
    if (username.split(" ").length > 1) {
      errors.username = "username should not have spaces in between";
    }
  }

  if (phone.trim() === "") {
    errors.phone = "Phone no. field must not be empty";
  }

  if (password === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

const validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim === "") {
    errors.username = "Username is not valid";
  }
  if (password.trim === "") {
    errors.password = "Password ins't valid";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports = { validateLoginInput, validateRegisterInput };
