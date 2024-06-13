let client = io({
  auth:{
    headers:token
  }
})
let lastUserId;
async function renderUsers(users) {
  for (const user of users) {
    let li = document.createElement("li");
    li.classList.add("chats-item");
    li.innerHTML = `
      <span data-id=${user.userid} class=${user.socketid ? 'online' : ""}></span>
      <img src="/file/${token}/${user.profileimg}" alt="profile-picture" />
      <p>${user.username}</p>
    `; 
  
    let list = document.getElementById("list");
    list.append(li);

    li.onclick = () => { 
      lastUserId = user.userid; 
      renderCurrentChat(user);
      getMessages(user.userid,user);
      form.style.display = "flex";
      chatMain.style.display = "flex";
      chatMain.innerHTML = null
    };
  }
} 

async function renderCurrentChat(user) {
  chatCurrent.innerHTML = `<img class="" src="/file/${token}/${user.profileimg}" alt="error">
  <h2>${user.username}</h2> 
  <span id="isTypeing"></span>`;
}

async function renderMessages(messages,user) {
  let name = await fetch(`/profileName/${token}`);
  let profileName = await name.json();
  for (const message of messages) {
    let div = document.createElement("div")    
    div.classList.add(`msg-wrapper`)
    div.setAttribute('data-id',`${message.messageid}`)

    if(message.messagetype == "plain/text"){      
      if (lastUserId == message.useridfrom) {  
        div.innerHTML += `
                      <img src="/file/${token}/${user.profileimg}" alt="profile-picture" />
                      <div class="msg-text">
                          <p class="msg-author">${user.username}</p>
                          <p data-id=${message.messageid} class="msg">${message.messagebody}</p>
                          <p class="time">12:00</p>
                      </div>
                  `;
        chatMain.append(div)
      } 

      else {
        let div = document.createElement("div")
        div.classList.add("msg-wrapper","msg-from")
        div.setAttribute('data-id',`${message.messageid}`)
        div.innerHTML += `
                      <p></p>
                      <div class="msg-text">
                          <p class="msg-author">${profileName}</p>
                          <div id="text">
                          <p class="msg" onkeyup=editMessage(event,this,${message.messageid}) contenteditable="true">${message.messagebody} </p>
                          <svg onclick=deleteFunc(${message.messageid}) class="delete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                          </div>
                          <p class="time">12:00</p>
                      </div>
                  `; 
        chatMain.append(div) 
      }
    }
    else { 
      if(lastUserId == message.useridfrom){
        let div = document.createElement("div")
      div.classList.add("msg-wrapper")
      div.innerHTML += ` 
                    <p></p> 
                    <img src="/file/${token}/${user.profileimg}" alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${user.username}</p>
                        <object data="/file/${token}/${message.messagebody}" class="msg object-class"></object>
                        <a href="#">
                            <img src="./img/download.png" width="25px" />
                        </a>
                        <p class="time">12:00</p>
                    </div>
                `;  
                chatMain.append(div) 
      }else{
        let div = document.createElement("div")
      div.classList.add("msg-wrapper","msg-from")
      div.innerHTML += ` 
                    <p></p>
                    <div class="msg-text">
                        <p class="msg-author">${profileName}</p>
                        <object data="/file/${token}/${message.messagebody}" class="msg object-class"></object>
                        <a href="#">
                            <img src="./img/download.png" width="25px" />
                        </a>
                        <p class="time">12:00</p>
                    </div>
                `;  
                chatMain.append(div) 
      }
    }  
    chatMain.scroll({top:1000000})
  }
}
 
async function profileRender(){
  profilImg.src = `/profileImg/${token}`;

  let name = await fetch(`/profileName/${token}`);
  profileName.textContent = await name.json();
}

async function getUsers() {
  users = await request("/users");
  renderUsers(users.data);
}

async function getMessages(userId,user) {

  let messages = await fetch(`/messages/${userId}`, {
    headers: {
      token: token,
    },
  });   
  messages = await messages.json();
  renderMessages(messages.data,user);
}  

async function myFunction(){
  let messageBody = textInput.value  
  let message = await fetch("/messages",{
    method:"POST", 
    headers:{
      "Content-Type":"application/json",
      token:token
    },
    body:JSON.stringify({messageBody,userId: lastUserId})
  })

  message = await message.json()
 
  if(message.status == 201){
    renderMessages(message.data)
    textInput.value = null
  }  

} 

async function uploadFile(){
  let formData = new FormData()
  formData.append("file",uploads.files[0])
  formData.append("userId",lastUserId)
  if(uploads.files[0].size > 1024*1024 * 5){
    return alert("File ni hajmi katta")
  }

  let message = await fetch("/messages",{
    method:"POST",
    headers:{
      token:token
    }, 
    body:formData 
  })
  message = await message.json()
 
  if(message.status == 201){
    renderMessages(message.data)
  }  

}

async function editMessage(event,p,messageId){
  if(event.keyCode == 13){
    let oldMessage = p.textContent
    let messageBody = p.textContent
    if(messageBody == ""){
      p.textContent = oldMessage
      p.blur()
      return 
    }
    let res = await fetch(`/messages/${messageId}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        token:token
      },
      body:JSON.stringify({messageBody})
    })
    res = await res.json()
    if(res.status == 201){
      p.blur() 
    }
  } 
}

async function deleteFunc(messageId){
  let messageDelete = await fetch(`/messages/${messageId}`,{
    method:"DELETE",
    headers:{
      "Content-Type":"application/json",
      token
    }
  })

  let res =await messageDelete.json()
  if(res.status === 200){
    let div = document.querySelector(`.chat-main div[data-id="${messageId}"]`)
    div.remove()
  }
}

getUsers();
profileRender();

let lastSelectId
textInput.onkeyup = (e) => {
  if(e.keyCode === 13){
    lastSelectId = undefined
    client.emit("message:stop",{to:lastUserId})
    return 
  }
  if(lastSelectId) return

  client.emit("message:typing",{to:lastUserId})

  lastSelectId = setTimeout(() => {
    lastSelectId = undefined 
    client.emit("message:stop",{to:lastUserId})
  }, 2000);
}

client.on("user:exit",() => {
  window.localStorage.clear()
  window.location = "/login"
}) 

client.on("user:connected",user => {
  let span = document.querySelector(`.chats-item span[data-id="${user[0].userid}"]`)
  span.classList.add("online") 
}) 
client.on("user:disconnected",(user)=>{
  let span = document.querySelector(`.chats-item span[data-id="${user[0].userid}"]`)
  span.classList.remove("online")
})  
 
client.on("new message",(message) => {
  renderMessages([message.message],message.message.user);        
})

client.on("messages:update",({messageid,messagebody}) => {
  
  let p = document.querySelector(`.msg-text p[data-id="${messageid}"]`)
  p && (p.textContent = messagebody)
})

client.on("message:delete",({messageFrom}) => {
  let div = document.querySelector(`.chat-main div[data-id="${messageFrom.messageid}"]`)
  if(lastUserId === messageFrom.useridfrom && div){
    div.remove()
  }
  
})

client.on("message:typing",({from}) => {
  if(lastUserId === from){
    isTypeing.textContent = "isTyping..."
  }
})

client.on("message:stop",({from}) => {
  if(lastUserId === from){
    isTypeing.textContent = ""
  }
})
