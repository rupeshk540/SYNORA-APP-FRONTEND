import { useEffect, useRef } from "react";

const GoogleSignInButton = ({ onSuccess, onError }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response) => {
                 console.log(response);
                if (response.credential) {
                    onSuccess(response.credential);
                } else {
                    onError?.();
                }
            },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
        });
    }, []);

    return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;