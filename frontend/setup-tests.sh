cd ../backend || exit
php artisan db:wipe || exit
php artisan migrate || exit
php artisan db:seed --class=FeatureTestsSeeder || exit