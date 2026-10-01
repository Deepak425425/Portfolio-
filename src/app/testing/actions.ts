"use server";

export async function authenticateTestingLab(password: string) {
  const correctPassword = process.env.TESTING_LAB_PASSWORD;
  
  if (!correctPassword) {
    console.error("TESTING_LAB_PASSWORD environment variable is not set.");
    return { success: false, error: "System configuration error. Please contact administrator." };
  }

  if (password === correctPassword) {
    return { success: true };
  }
  
  return { success: false, error: "Incorrect password. Please try again." };
}

export async function logoutTestingLab() {
  // Now handled client-side via React context
}
