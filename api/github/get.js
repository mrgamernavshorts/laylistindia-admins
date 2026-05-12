import { Octokit } from "octokit"

export default async function Handler(req, res) {

    const octokit = new Octokit({
        auth: process.env.VITE_GITHUB_API_KEY
    })

    const {FileName} = req.query

    try {
        const { data, error } = await octokit.rest.repos.getContent({
            owner: "mrgamernavshorts",
            repo: "laylistindia",
            path: `data/${FileName}`
        })
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error)

    }

}