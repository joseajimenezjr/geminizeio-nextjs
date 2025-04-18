// This is a utility script to help identify problematic imports
// You can run this with: node -r ts-node/register scripts/fix-imports.ts

import * as fs from "fs"
import * as path from "path"

const rootDir = path.resolve(__dirname, "..")
const problemImports = [
  /import\s+.*?\{\s*.*?useEffectEvent.*?\}\s+from\s+['"]react['"]/,
  /import\s+.*?\*\s+as\s+React\s+from\s+['"]react['"]/,
]

function searchFiles(dir: string, fileExtensions: string[] = [".ts", ".tsx"]): void {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      searchFiles(filePath, fileExtensions)
    } else if (fileExtensions.some((ext) => file.endsWith(ext))) {
      const content = fs.readFileSync(filePath, "utf8")

      for (const pattern of problemImports) {
        if (pattern.test(content) && content.includes("useEffectEvent")) {
          console.log(`Potential issue in: ${filePath}`)
          // You could automatically fix the imports here if needed
        }
      }
    }
  }
}

searchFiles(rootDir)
console.log("Search complete")
