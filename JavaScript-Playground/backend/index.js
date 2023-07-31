const express = require("express")
const cors = require("cors")

require("dotenv").config()
require("./config/db.connection")

const { generateFile } = require("./generateFile")
const { executeJs } = require("./executeJs")
const { testCases } = require("./testCases")
const { addJobToQueue } = require('./jobQueue')
const Job = require("./models/Job")

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



// get route
app.get('/status', async (req, res) => {
    const jobId = req.query.id
    console.log("status requested", jobId)
    if (jobId === undefined) {
        return res.status(400).json({ success: false, error: "missing id query parameter" })
    }
    try {
        const job = await Job.findById(jobId)

        if (job === undefined) {
            return res.status(404).json({ success: false, error: "invalid job id" })
        }

        return res.status(200).json({ success: true, job })

    } catch (err) {
        return res.status(400).json({ success: false, error: JSON.stringify(err) })
    }
})

// post operation for run cases
app.post("/run", async (req, res) => {

    const { language, code } = req.body
    console.log(language, code.length)

    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code body" })
    }
    let job
    try {
        // need to generate a js file with content from the request
        const filepath = await generateFile(language, code)

        job = await new Job({ language, filepath }).save()
        const jobId = job["_id"]
        addJobToQueue(jobId)
        // console.log(job)
        res.status(201).json({ success: true, jobId })

        // We need to run the file and send the response

    } catch (err) {
        return res.status(500).json({ success: false, error: JSON.stringify(err)})
    }
})

// operation for test cases
app.post("/test", async (req, res) => {
    const { language = "js", code } = req.body

    if (code === undefined) {
        return res.status(400).json({ success: "false", error: "Empty code body" })
    }
    try {
        const filepath = await generateFile(language, code)
        const output = await executeJs(filepath)
        const result = await testCases(filepath)
        return res.json({ filepath, output, result })
    } catch (err) {
        res.status(500).json({ err })
    }
})

app.listen(1000, () => {
    console.log("listening on port 1000!")
})