import fs from 'fs';
import path from 'path';

// Define the root directory to search
const rootDir = process.cwd();

// Define directories and files to exclude from the replacement
const excludeList = ['node_modules', 'dist', '.git', '.gemini', 'package-lock.json', 'rename_script.js'];

function walkSync(dir, callback) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
      if (excludeList.includes(file)) return;
      
      const filepath = path.join(dir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.isDirectory()) {
        walkSync(filepath, callback);
      } else if (stats.isFile()) {
        // Skip images and binary files
        if (filepath.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|mp4|webm)$/i)) return;
        callback(filepath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

console.log(`Starting find-and-replace in: ${rootDir}\n`);

let updatedFilesCount = 0;

walkSync(rootDir, (filepath) => {
  try {
    const originalContent = fs.readFileSync(filepath, 'utf8');
    let content = originalContent;
    
    // 1. Replace Standard Title Case
    content = content.replace(/Apna Electro/g, 'Apna Catalyst');
    
    // 2. Replace Lowercase
    content = content.replace(/apna electro/g, 'apna catalyst');
    
    // 3. Replace Uppercase
    content = content.replace(/APNA ELECTRO/g, 'APNA CATALYST');
    
    // 4. Replace Kebab-case (common in package names and urls)
    content = content.replace(/apna-electro/g, 'apna-catalyst');
    
    // 5. Replace Snake_case (common in variable names, DB, local storage keys)
    content = content.replace(/apna_electro/g, 'apna_catalyst');
    
    // 6. Replace concatenated (like in email addresses or UPI IDs)
    content = content.replace(/apnaelectro/g, 'apnacatalyst');

    // If changes were made, write them back to the file
    if (content !== originalContent) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(rootDir, filepath)}`);
      updatedFilesCount++;
    }
  } catch (error) {
    console.error(`❌ Failed to process ${filepath}:`, error.message);
  }
});

console.log(`\n🎉 Done! Successfully updated ${updatedFilesCount} files.`);
