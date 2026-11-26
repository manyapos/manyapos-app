#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::process::{Command, Child};
use std::sync::Mutex;

struct ServerProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Start the Next.js production server
            let resource_dir = app.path_resolver().resource_dir().unwrap();
            let server_dir = resource_dir.join("server");

            // Use bundled node or system node to start the server
            let child = Command::new("node")
                .arg("server.js")
                .current_dir(&server_dir)
                .env("PORT", "17710")
                .env("HOSTNAME", "127.0.0.1")
                .spawn()
                .expect("Failed to start Next.js server");

            app.manage(ServerProcess(Mutex::new(Some(child))));

            // Wait a moment for server to boot, then load
            let window = app.get_window("main").unwrap();
            std::thread::spawn(move || {
                // Poll until server is ready
                for _ in 0..60 {
                    if std::net::TcpStream::connect("127.0.0.1:17710").is_ok() {
                        let _ = window.eval("window.location.replace('http://127.0.0.1:17710')");
                        return;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(500));
                }
                eprintln!("Server failed to start within 30s");
            });

            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::Destroyed = event.event() {
                // Kill the server when window closes
                if let Some(state) = event.window().try_state::<ServerProcess>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(mut child) = guard.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
