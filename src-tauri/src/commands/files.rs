use std::fs;
use std::path::Path;
use base64::{engine::general_purpose, Engine as _};
use tauri::command;

#[command]
pub fn save_project(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[command]
pub fn load_project(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Returns all image file paths under `dir`, recursively, as paths relative to `dir`.
#[command]
pub fn list_dir_images(dir: String) -> Result<Vec<String>, String> {
    let base = Path::new(&dir);
    if !base.exists() {
        return Ok(vec![]);
    }
    let mut results = Vec::new();
    collect_images(base, base, &mut results).map_err(|e| e.to_string())?;
    results.sort();
    Ok(results)
}

fn collect_images(base: &Path, current: &Path, out: &mut Vec<String>) -> std::io::Result<()> {
    for entry in fs::read_dir(current)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_images(base, &path, out)?;
        } else if is_image(&path) {
            if let Ok(rel) = path.strip_prefix(base) {
                out.push(rel.to_string_lossy().replace('\\', "/"));
            }
        }
    }
    Ok(())
}

fn is_image(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()).as_deref(),
        Some("png" | "jpg" | "jpeg" | "webp" | "gif")
    )
}

/// Copies a single file, creating parent directories as needed.
#[command]
pub fn copy_file(src: String, dest: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&dest).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::copy(&src, &dest).map(|_| ()).map_err(|e| e.to_string())
}

/// Recursively copies `src` directory into `dest`.
#[command]
pub fn copy_dir_all(src: String, dest: String) -> Result<(), String> {
    copy_dir_recursive(Path::new(&src), Path::new(&dest)).map_err(|e| e.to_string())
}

/// Reads an image file and returns it as a base64-encoded string.
#[command]
pub fn read_image_base64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    Ok(general_purpose::STANDARD.encode(bytes))
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> std::io::Result<()> {
    if !src.exists() {
        return Ok(());
    }
    fs::create_dir_all(dest)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let dest_child = dest.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_dir_recursive(&entry.path(), &dest_child)?;
        } else {
            fs::copy(entry.path(), dest_child)?;
        }
    }
    Ok(())
}
