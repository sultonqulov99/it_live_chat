
showButton.onclick = () => {  
    if (showButton.classList.contains('zmdi-eye')) {
        showButton.classList.remove('zmdi-eye')
        showButton.classList.add('zmdi-eye-off')
        passwordInput.type = 'text'
    } else {
        showButton.classList.remove('zmdi-eye-off')
        showButton.classList.add('zmdi-eye')
        passwordInput.type = 'password'
    }
}




submitButton.addEventListener("click",async(e) => {
    let name = usernameInput.value
    let pass = passwordInput.value
    let file = uploadInput.files[0]

    let formData = new FormData()
    formData.append("userName", name)
    formData.append("password",pass)
    formData.append("profileImg",file)

    let userRegister = await fetch("/register",{
        method:"POST",
        body: formData
    })

    let res = await userRegister.json()
    if(res.status == 201) {
        window.localStorage.setItem("token",res.token)
        window.location = "/"
    }
    else {
        span.textContent = res.message
    }
})