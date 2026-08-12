# Crop and copy all UI screenshots

# Level 1 Screenshots
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-1\screenshots\01_sandbox_generator.png -x 855 -y 370 -w 400 -h 190
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-1\screenshots\02_balance_retrieved.png -x 855 -y 370 -w 400 -h 190
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-1\screenshots\03_broadcast_successful.png -x 855 -y 570 -w 400 -h 355
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-1\screenshots\04_stellar_expert_verification.png -x 855 -y 570 -w 400 -h 355

# Level 2 Screenshots
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-2\screenshots\01_multi_wallet_modal.png -x 25 -y 370 -w 810 -h 110
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-2\screenshots\02_contract_read_state.png -x 25 -y 490 -w 810 -h 410
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-2\screenshots\03_contract_write_success.png -x 25 -y 490 -w 810 -h 410
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_sandbox.png -dest .\level-2\screenshots\04_event_listener_active.png -x 25 -y 490 -w 810 -h 410

# Level 4 Screenshots
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-4\screenshots\01_paisa_remittance_dashboard.png -x 0 -y 0 -w 1280 -h 1050
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-4\screenshots\02_kyc_whitelist_console.png -x 25 -y 480 -w 610 -h 200
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-4\screenshots\03_user_cohort_table.png -x 25 -y 1000 -w 610 -h 470
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-4\screenshots\04_sla_analytics_dashboard.png -x 660 -y 580 -w 590 -h 610

# Level 5 Screenshots
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-5\screenshots\01_cohort_search_filter.png -x 25 -y 1000 -w 610 -h 470
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-5\screenshots\02_rate_alert_triggered.png -x 660 -y 370 -w 590 -h 200
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-5\screenshots\03_fee_savings_optimizer.png -x 25 -y 370 -w 610 -h 100

# Level 6 Screenshots
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-6\screenshots\01_gasless_fee_sponsorship.png -x 25 -y 700 -w 610 -h 300
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-6\screenshots\02_dual_network_switch.png -x 750 -y 320 -w 500 -h 80
powershell -File .\scripts\crop.ps1 -src .\screenshots_temp\local_home.png -dest .\level-6\screenshots\03_twitter_launch_thread.png -x 660 -y 1200 -w 590 -h 260

Write-Host "All UI screenshots cropped and saved successfully."
