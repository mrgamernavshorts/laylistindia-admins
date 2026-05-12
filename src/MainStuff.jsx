import { useEffect, useState } from "react"
import LogOutLogo from "./assets/LogOut.svg"
import supabase from "./SupaBase-Client"

function MainStuff(props){

  //Other Things
  const [CurrentTab, SetCurrentTab] = useState("welcome")
  const [AdminUname, SetAdminUname] = useState()
  const [AdminPass, SetAdminPass] = useState()
  const [AdminList, SetAdminList] = useState([])
  const [JsonData, SetJsonData] = useState()

  //For Updating Records
  const [UnameForRecs, SetUnameForRecs] = useState()
  const [LevelNameForRec, SetLevelNameforRec] = useState()
  const [CompletionProof, SetCompletionProof] = useState()
  const [Platform, SetPlatform] = useState()
  const [DeviceHz, SetDeviceHz] = useState()

  //For Updating Levels
  const [LevelNameToUpdate, setLevelNameUpdate] = useState()
  const [UpdatedLevelName, setUpdatedLevelName] = useState()
  const [UpdatedCreatorUname, SetUpdatedCreatorUname] = useState()
  const [UpdatedLevelId, SetUpdatedLevelId] = useState()
  const [UpdatedVerifierName, SetUpdatedVerifierName] = useState()
  const [UpdatedVerificationLink, SetUpdatedVerificationLink] = useState()

  //for Deleting records and levels
  const [LevelNameToDelete, SetLevelNameToDelete] = useState()
  const [FileNameWithRecordToDelete, SetFileNameWithRecordToDelete] = useState()
  const [RecordUNameToDelete, SetRecordUNameToDelete] = useState()

  //My code is a mess :(

  const FetchUNames = async() => {
    const {data, error} = await supabase
    .from("admins")
    .select("UserName")

    SetAdminList(data)
  }

  const GetFile = async(FileName) => {
    const res = await fetch(`/api/github/get?FileName=${!FileName ? "temp": FileName}.json`)
    const data = await res.json()
    return atob(data.content)
  }

  const SendFile = async(FileName, Content, e) => {
    e.target.value = "Submitting...."
    const {data, error} = await fetch("/api/github/post?type=create", {
    headers: {
      "Content-Type": "application/json"
    },
      method: "POST",
      body: JSON.stringify({
        Content,
        FileName
      })
    }) 
    alert("Level Submitted successfully")
    if (error) {
      console.error(error)
      alert("Something went wrong. check console for details.")
      return
    }
  }

  useEffect(() => {
    FetchUNames()
    async function InitJsonData() {
      const Parsed = JSON.parse(await GetFile())
      SetJsonData(Parsed)
    }
    InitJsonData()
  }, [])

  const CreateAdmin = async(e) => {
    e.target.textContent = "Creating Admin..."

    const {data, error} = await supabase
    .from("admins")
    .insert([{UserName: AdminUname, password: AdminPass}])

    if (error) {
      console.error(error)
      alert("An Unexpected error occured. check console for more details")
      e.target.value = "Submit"
      return
    }
    
    e.target.textContent = "Submit"
    SetAdminUname("")
    alert("Admin created successfully")
    e.target.value = "Submit"
  }

  const DeleteAdmin = async(e) => {
    e.target.textContent = "Deleting Admin..."

    const {data, error} = await supabase
    .from("admins")
    .delete()
    .eq("UserName", AdminUname)

    if (error) {
      console.error(error)
      alert("Unexpected error occured")
      return
    }

    e.target.textContent = "Submit" 
    alert("Admin Deleted Successfuly")
    SetAdminUname()
  }

  const UpdateRecords = async(e) => {
    const res = await fetch(`/api/github/get?FileName=${LevelNameForRec}.json`)
    const FetchedRecs = await res.json()
    const DecodedJson = JSON.parse(atob(FetchedRecs.content))
    const FinalRec = [...DecodedJson.records, {
      "user": UnameForRecs,
      "link": CompletionProof,
      "percent": 100,
      "hz": DeviceHz,
      "mobile" : Platform.toLowerCase() == "mobile" ? true : false
    }]

    const fetchedJson = JSON.parse(await GetFile(LevelNameForRec))

    const FinalJson = {...fetchedJson, records: FinalRec}

    const {data, error} = await fetch("/api/github/post?type=update", {
    headers: {
      "Content-Type": "application/json"
    },
      method: "POST",
      body: JSON.stringify({
        Content: FinalJson,
        FileName: LevelNameForRec
      })
    }) 

    alert("Records submitted")
  }

  const UpdateLevel = async() => {
    if (!LevelNameToUpdate) {
      alert("An error Occured. Jk just type in the Level Name to Update Bro.")
      return
    }

    const res = await fetch(`api/github/get?FileName=${LevelNameToUpdate}.json`)
    const ResJson = await res.json()
    const FinalJson = JSON.parse(atob(ResJson.content))

    const NewJson = {...FinalJson,
      id: UpdatedLevelId ? UpdatedLevelId : FinalJson.id,
      name: UpdatedLevelName ? UpdatedLevelName : FinalJson.name,        
      author: UpdatedCreatorUname ? UpdatedCreatorUname : FinalJson.author,
      creators: UpdatedCreatorUname ? [UpdatedCreatorUname] : [FinalJson.creators[0]],
      verifier: UpdatedVerifierName ? UpdatedVerifierName : FinalJson.verifier,
      verification: UpdatedVerificationLink ? UpdatedVerificationLink : FinalJson.verification
    }

    try {
      await fetch("api/github/post?type=update", {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          FileName: LevelNameToUpdate,
          Content: NewJson
        })
      })
      alert("Level Updated")
    } catch (error) {
      console.error(error)
      alert("An Error Occured. Check Console for details.")
    }

  }

  const DeleteLevel = async() => {
    try {
      await fetch("/api/github/post?type=delete", {
        headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        FileName: LevelNameToDelete
      })
      })

      alert("Level Deleted Sucessfully")
    } catch (error) {
      console.error(error)
      alert("An unexpected error occured. Check Console for details.")
    }
  }

  const DeleteRecord = async() => {
    const res = await fetch(`/api/github/get?FileName=${FileNameWithRecordToDelete}.json`)
    const resJson = await res.json()
    const JsonFile = JSON.parse(atob(resJson.content))
    const Recs = JsonFile.records
    const UpdatedRecs = Recs.filter(i => i.user !== RecordUNameToDelete)

    const NewJson = {...JsonFile, records: UpdatedRecs}

    try {
      await fetch("/api/github/post?type=update", {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          FileName: FileNameWithRecordToDelete,
          Content: NewJson
        })
      })
      alert("Record Deleted")
    } catch (error) {
      console.error(error)
      alert("Err Occured. Check Console for details.")
    }
  }

  return(<>
  <div className="MainStuffBar">
    <details>
      <summary>Add</summary>
      <button onClick={() => SetCurrentTab("AddLevel")}>Level</button>
      <button onClick={() => SetCurrentTab("AddRecord")}>Record</button>
      <button onClick={() => SetCurrentTab("AddAdmin")}>Admin</button>
    </details>
    <details>
      <summary>Update</summary>
      <button onClick={() => SetCurrentTab("UpdateLevel")}>Level</button>
      {/*<button onClick={() => SetCurrentTab("UpdateRecord")}>Record</button>-->*/}
    </details>
    <details>
      <summary>Delete</summary>
      <button onClick={() => SetCurrentTab("DeleteLevel")}>Level</button>
      <button onClick={() => SetCurrentTab("DeleteRecord")}>Record</button>
      <button onClick={() => SetCurrentTab("DeleteAdmin")}>Admin</button>
    </details>
    <button onClick={() => location.reload()}><img src={LogOutLogo}/></button>
  </div>
  <div className="tabs">
    {CurrentTab !== "welcome" && (<center><i><b style={{color: "red"}}>Everything is case sensistive!</b></i></center>)}
    {CurrentTab == "welcome" && (
      <center>
        <h1>welcome, <span style={{color: "goldenrod"}}>{props.Uname}</span></h1>

        <p style={{color : "gray"}}><i>(The Updating, creating, etc of levels can take a bit of time. So, please be patient and do not spam.)</i></p>
      </center>
    )}
    {CurrentTab == "AddLevel" && (
      <center>
        <h1>Add a Level</h1>
        <p>Enter <b><span style={{color: "goldenrod"}}>Creator Username</span></b></p>
        <input type="text" placeholder="Creator Name..." onChange={(e) => SetJsonData({...JsonData, creators: [e.target.value], author: e.target.value, records: []})}/>
        <p>Enter <b><span style={{color: "goldenrod"}}>Verifier Name</span></b></p>
        <input type="text" placeholder="Verifier Name..." onChange={(e) => {SetJsonData({...JsonData, verifier: e.target.value})}}/>
        <p>Enter <b><span style={{color: "goldenrod"}}>Level Name</span></b></p>
        <input type="text" placeholder="Level Name..." onChange={(e) => {SetJsonData({...JsonData, name: e.target.value})}}/>
        <p>Enter <b><span style={{color: "goldenrod"}}>Level ID</span></b></p>
        <input type="text" placeholder="Level ID..." onChange={(e) => SetJsonData({...JsonData, id: Number(e.target.value)})}/>
        <p>Enter <b><span style={{color: "goldenrod"}}>Verification Link</span></b></p>
        <input type="text" placeholder="Verification Link..." onChange={(e) => SetJsonData({...JsonData, verification: e.target.value})}/>

        <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit";SendFile(JsonData.name , JsonData, e)}}>Submit</button>
      </center>
    )}
    {CurrentTab == "AddRecord" && (
    <center>
      <h1>Add a Record</h1>
      <p>Enter <span style={{color: "goldenrod"}}>Username</span></p>
    <input type="text" placeholder="Enter Username..." onChange={(e) => SetUnameForRecs(e.target.value)}/>
      <p>Enter <span style={{color: "goldenrod"}}>Level</span> Name</p>
      <input type="text" placeholder="Enter Level name..." onChange={(e) => SetLevelNameforRec(e.target.value)}/>
      <p>Enter <span style={{color: "goldenrod"}}>Completion</span> Proof</p>
      <input type="text" placeholder="Enter Completion Proof..." onChange={(e) => SetCompletionProof(e.target.value)}/>
      <p>Enter <span style={{color: "goldenrod"}}>Platform (Mobile/Pc lowercase)</span></p>
      <input type="menu" placeholder="Enter Platform..." onChange={(e) => SetPlatform(e.target.value)}/>
      <p>Enter <span style={{color: "goldenrod"}}>Device Referesh Rate</span></p>
      <input type="text" placeholder="Enter Refresh Rate" onChange={(e) => SetDeviceHz(e.target.value)}/>
      
      <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit"; UpdateRecords(e)}}>Submit</button>
    </center>
    )}
    {CurrentTab == "AddAdmin" && (
      <center>
      <h1>Add Admin</h1>
      <p>Enter <span style={{color: "goldenrod"}}>New Admin's Username</span></p>
      <input type="text" placeholder="Enter New Admin's Username..." onChange={(e) => SetAdminUname(e.target.value)}/>
      <p>Enter  <span style={{color: "goldenrod"}}>New Admin's Password</span></p>
      <input type="text" placeholder="Enter New Admin's Password..." onChange={(e) => SetAdminPass(e.target.value)}/>

      <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "submit";CreateAdmin(e)}}>Submit</button>
      </center>
    )}
    {CurrentTab == "UpdateLevel" && (
      <center>
        <h1>Update a Level</h1>
        <b><i style={{color: "red"}}>Update the Level name for giving badges only. If you have made a mistake, delete the level and then recreate it with correct values.</i></b>
        <p style={{color : "gray"}}><i>(Leave Blank if no changes need to be made.)</i></p>
        <p>Enter <b><span style={{color: "goldenrod"}}>Level Name</span> to Update (Without Badge)</b></p>
       <input type="text" placeholder="Level Name..." onChange={(e) => setLevelNameUpdate(e.target.value)}/>
        <p>Update <b><span style={{color: "goldenrod"}}>Level Name</span>(Only for badge.)</b></p>
       <input type="text" placeholder="Updated Level Name..." onChange={(e) => setUpdatedLevelName(e.target.value)}/>       
       <p>Update <b><span style={{color: "goldenrod"}}>Creator Username</span></b></p>
       <input type="text" placeholder="Updated Creator Name..." onChange={(e) => SetUpdatedCreatorUname(e.target.value)}/>
        <p>Update <b><span style={{color: "goldenrod"}}>Verifier Name</span></b></p>
        <input type="text" placeholder="Updated Verifier Name..." onChange={(e) => SetUpdatedVerifierName(e.target.value)}/>
       <p>Update <b><span style={{color: "goldenrod"}}>Level ID</span></b></p>
       <input type="text" placeholder="Updated Level ID..." onChange={(e) => SetUpdatedLevelId(e.target.value)}/>

        <p>Update <b><span style={{color: "goldenrod"}}>Verification Link</span></b></p>
        <input type="text" placeholder="Updated Verification Link..." onChange={(e) => SetUpdatedVerificationLink(e.target.value)}/>

        <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit"; UpdateLevel()}}>Submit</button>
      </center>
    )}
    {/*CurrentTab == "UpdateRecord" && (
    <center>
      <h1>Update a Record</h1>
      <p style={{color : "gray"}}><i>(Leave Blank if no changes need to be made.)</i></p>
      <p>Enter <span style={{color: "goldenrod"}}>Username</span> of Player to be updated</p>
      <input type="text" placeholder="Enter Username..."/>
      <p>Enter <span style={{color: "goldenrod"}}>Level ID</span> of Player's Completion</p>
      <input type="text" placeholder="Enter Level ID..."/>
      <p>Update <span style={{color: "goldenrod"}}>Level</span> Name</p>
      <input type="text" placeholder="Enter Level name..."/>
      <p>Update <span style={{color: "goldenrod"}}>Completion</span> Proof</p>
      <input type="text" placeholder="Enter Completion Proof..."/>
      <p>Update <span style={{color: "goldenrod"}}>Platform (Mobile/Pc)</span></p>
      <input type="text" placeholder="Enter Platform..."/>
      <p>Update <span style={{color: "goldenrod"}}>Device Referesh Rate</span></p>
      <input type="text" placeholder="Enter Refresh Rate"/>
      
      <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => e.target.textContent = "Submit"}>Submit</button>
    </center>
    )*/}
    {CurrentTab == "DeleteLevel" && (
     <center>
      <h1>Delete a Level</h1>
      <p>Enter <span style={{color: "goldenrod"}}>Level Name</span> to Delete</p>
      <input type="text" placeholder="Enter Level Name..." onChange={(e) => SetLevelNameToDelete(e.target.value)}/>
      <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit"; DeleteLevel()}}>Submit</button>
     </center> 
    )}
    {CurrentTab == "DeleteRecord" && (
      <center>
        <h1>Delete a Record</h1>
        <p>Enter <span style={{color: "goldenrod"}}>Level Name</span></p>
        <input type="text" placeholder="Level Name..." onChange={(e) => SetFileNameWithRecordToDelete(e.target.value)}/>
        <p>Enter <span style={{color: "goldenrod"}}>UserName</span></p>
        <input placeholder="Username..." onChange={(e) => SetRecordUNameToDelete(e.target.value)}/>


        <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit"; DeleteRecord()}}>Submit</button>
      </center>
    )}
    {CurrentTab == "DeleteAdmin" && (
      <center>
        <h1>Remove Admin</h1>

        <p>List of Admins:</p>
        {AdminList.map(i => <p key={i.id}>{i.UserName}</p>)}

        <p>Enter <span style={{color: "goldenrod"}}>Admin Username</span> to remove</p>
        <input type="text" placeholder="Enter Admin Name"  onChange={(e) => SetAdminUname(e.target.value)}/>

        <button onClick={(e) => e.target.textContent = "Double click to confirm"} onDoubleClick={(e) => {e.target.textContent = "Submit"; DeleteAdmin(e)}}>Submit</button>
      </center>
    )}
  </div>
  </>
  )
}

export default MainStuff