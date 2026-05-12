import { useEffect, useState } from "react"
import MainStuff from "./MainStuff"
import supabase from "./SupaBase-Client"

function App(){
  const [IsLoggedIn, SetIsLoggedIn] = useState(false)
  const [UserName, SetUserName] = useState()
  const [Password, SetPassword] = useState()
  const [MissingCrendentialWarning, SetMissingCredentialWarning] = useState(false)

  const ValidateCredentials = async (e) => {
    e.target.textContent = "Veryfying..."

    const { data, error} = await supabase
    .from("admins")
    .select("*")
    .eq("UserName", UserName)
    .eq("password", Password)
    .single()

    if (error) console.error(error)
      
    if (error || !data){
      SetMissingCredentialWarning(true)
      e.target.textContent = "Login"
      return
    }
    SetIsLoggedIn(true)
    e.target.textContent = "Login"
  }

  return(
    <>
    <center>
      {!IsLoggedIn && (<div className="AuthPopover">
        <h1><i style={{color: "green"}}>TILL</i> <span style={{color: "red"}}>ADMIN</span> WEBSITE</h1>
        <p><span style={{color: "darkgoldenrod"}}>Admin</span> Username</p>
        <input type="text" placeholder="Enter Name" id="UserNameInput" onChange={(e) => SetUserName(e.target.value)}/>
        <p><span style={{color: "darkgoldenrod"}}>Admin</span> Password</p>
        <input type="password" placeholder="Enter Password" id="PasswordInput" onChange={(e) => SetPassword(e.target.value)}/>
        <button style={{display: "block", marginTop: "30px"}} onClick={(e) => {ValidateCredentials(e)}}>Login</button>
        {MissingCrendentialWarning && (<div className="CredentialWarning">
          <p>⚠️ Warning: Wrong Credentials</p>
        </div>)}
      </div>)}
    </center>
    {IsLoggedIn && (<div className="MainContent">
      <MainStuff Uname={UserName}/>
    </div>)}
    </>
  )
}

export default App