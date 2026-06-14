use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineFileCheck {
    label: String,
    path: String,
    exists: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineCommandOutput {
    status: Option<i32>,
    stdout: String,
    stderr: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineInspectionResult {
    engine_root: String,
    checks: Vec<EngineFileCheck>,
    effect_contract: EngineCommandOutput,
    navigation_contract: EngineCommandOutput,
}

#[tauri::command]
pub fn inspect_engine_root(engine_root: String) -> Result<EngineInspectionResult, String> {
    let root = PathBuf::from(&engine_root);

    if !root.exists() {
        return Err(format!("Engine root does not exist: {}", engine_root));
    }

    if !root.is_dir() {
        return Err(format!("Engine root is not a directory: {}", engine_root));
    }

    let checks = vec![
        make_check(
            "Effect contract script",
            &root,
            "engine/tools/print_effect_contract.py",
        ),
        make_check(
            "Navigation contract script",
            &root,
            "engine/tools/print_navigation_contract.py",
        ),
        make_check("Campaigns folder", &root, "engine/campaigns"),
    ];

    let missing: Vec<&EngineFileCheck> = checks.iter().filter(|check| !check.exists).collect();

    if !missing.is_empty() {
        let labels = missing
            .iter()
            .map(|check| format!("{} ({})", check.label, check.path))
            .collect::<Vec<String>>()
            .join(", ");

        return Err(format!(
            "Selected folder is not a valid soloRPG engine root. Missing: {}",
            labels
        ));
    }

    let effect_contract = run_python_tool(&root, "engine/tools/print_effect_contract.py")?;
    let navigation_contract = run_python_tool(&root, "engine/tools/print_navigation_contract.py")?;

    Ok(EngineInspectionResult {
        engine_root,
        checks,
        effect_contract,
        navigation_contract,
    })
}

fn make_check(label: &str, root: &Path, relative: &str) -> EngineFileCheck {
    let full_path = root.join(relative);

    EngineFileCheck {
        label: label.to_string(),
        path: full_path.to_string_lossy().to_string(),
        exists: full_path.exists(),
    }
}

fn run_python_tool(root: &Path, relative_script_path: &str) -> Result<EngineCommandOutput, String> {
    let output = Command::new("python3")
        .arg(relative_script_path)
        .current_dir(root)
        .output()
        .map_err(|err| format!("Failed to run python3 {}: {}", relative_script_path, err))?;

    Ok(EngineCommandOutput {
        status: output.status.code(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    })
}
