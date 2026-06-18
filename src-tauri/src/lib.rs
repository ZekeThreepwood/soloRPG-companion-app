mod commands;

use commands::engine::inspect_engine_root;
use commands::files::{copy_dir_all, copy_file, list_dir_images, list_templates, load_project, read_image_base64, save_project, save_template};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            inspect_engine_root,
            save_project,
            load_project,
            list_dir_images,
            copy_file,
            copy_dir_all,
            read_image_base64,
            save_template,
            list_templates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
