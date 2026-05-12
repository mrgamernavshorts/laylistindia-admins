import { Octokit } from "octokit";

export default async function Handler(req, res) {

    const host = req.headers.host

    const protocol = host.includes("localhost") ? "http": "https"

    const { type } = req.query

    const octokit = new Octokit({
        auth: process.env.VITE_GITHUB_API_KEY
    })

    const { FileName, Content } = req.body

    const ListFile = await fetch(`${protocol}://${req.headers.host}/api/github/get?FileName=_list.json`)

    const FileToUpdate = await fetch(`${protocol}://${req.headers.host}/api/github/get?FileName=${FileName}.json`)

    const ListFileJson = await ListFile.json()

    const FileToUpdateJson = await FileToUpdate.json()

    const DecodedContents = JSON.parse(Buffer.from(ListFileJson.content, "base64").toString("utf8"))

    try {

        if (type === "create" || !type) {
            const JsonString = JSON.stringify(Content, null, 2)
            const Encoded = Buffer.from(JsonString).toString("base64")
            const FinalListFile = [...DecodedContents, FileName]

            const EncodedFinalListFile = Buffer.from(JSON.stringify(FinalListFile, null, 2)).toString("base64")

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: "mrgamernavshorts",
                repo: "laylistindia",
                path: `data/${FileName}.json`,
                content: Encoded,
                message: "Create level"
            })

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: "mrgamernavshorts",
                repo: "laylistindia",
                path: "data/_list.json",
                content: EncodedFinalListFile,
                sha: ListFileJson.sha,
                message: "Update list"
            })

        } else if (type === "update") {
            const JsonString = JSON.stringify(Content, null, 2)
            const Encoded = Buffer.from(JsonString).toString("base64")

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: "mrgamernavshorts",
                repo: "laylistindia",
                path: `data/${FileName}.json`,
                content: Encoded,
                sha: FileToUpdateJson.sha,
                message: "Update level"
            })

            
        } else if(type === "delete") {

            console.log(FileToUpdateJson)

            const FinalListFile = DecodedContents.filter(i => i !== FileName)

            const EncodedFinalListFile = Buffer.from(JSON.stringify(FinalListFile, null, 2)).toString("base64")

            await octokit.rest.repos.deleteFile({
                owner: "mrgamernavshorts",
                repo: "laylistindia",
                path: `data/${FileName}.json`,
                message: "delete level",
                sha: FileToUpdateJson.sha
            })
            
            await octokit.rest.repos.createOrUpdateFileContents({
                owner: "mrgamernavshorts",
                repo: "laylistindia",
                path: "data/_list.json",
                content: EncodedFinalListFile,
                sha: ListFileJson.sha,
                message: "Update list"
            })
        }



        res.status(200).json({ success: true })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}