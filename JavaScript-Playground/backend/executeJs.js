const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")


const outputPath = path.join(__dirname, "outputs")

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
}

const executeJs = (filepath) => {
    const jobId = path.basename(filepath).split(".")[0]
    const outPath = path.join(outputPath, `${jobId}.out`)
    
    return new Promise((resolve, reject) => {
        exec(`node ${filepath} -o ${outPath} `, 
        (error, stdout, stderr) => {
            error && reject({error, stderr})
            stderr && reject(stderr)
            resolve(stdout)
        })
    })
}
// `g++ ${filepath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`

module.exports = {
    executeJs,
}