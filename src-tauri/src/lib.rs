mod commands;

use commands::engine::inspect_engine_root;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![inspect_engine_root])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
