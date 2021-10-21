module.exports = {
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            width: {
                'navbar': '200px'
            },
            minWidth: {
                'navbar': '200px'
            },
        }
    },
    variants: {
        extend: {
            opacity: ['disabled'],
            backgroundColor: ['disabled'],
            cursor: ['disabled', 'hover'],
            padding: ['disabled']
        }
    },
    plugins: [],
}
