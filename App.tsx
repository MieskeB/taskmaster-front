import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, Button, Alert, Platform} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import {storage} from "./services/storage";
import {Challenge} from "./model/Challenge";
import LoginModal from "./components/LoginModal";
import Toast from "react-native-toast-message";

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loginVisible, setLoginVisible] = useState<boolean>(false);
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [teamName, setTeamName] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const storedToken = await storage.getItem("token");
            if (!storedToken) {
                setLoginVisible(true);
                return;
            }

            await handleIsLoggedIn();
        })();
    }, []);

    const handleIsLoggedIn = async () => {
        setLoginVisible(false);
        const storedToken = await storage.getItem("token");
        if (!storedToken) return;

        setToken(storedToken);
        const team = storedToken.split("_")[0];
        setTeamName(team);

        fetchChallenge(team);
    };

    const fetchChallenge = async (teamName: string) => {
        try {
            const response = await axios.get("https://api.taskmaster.michelbijnen.nl/challenge/current");
            const challengeData: Challenge = response.data;
            setChallenge(challengeData);

            const submitted = challengeData.submissions.some(
                (submission) => submission.team?.teamName === teamName
            );
            setHasSubmitted(submitted);
        } catch (e) {
            console.error("Failed to load challenge", e);
        }
    };

    const formatDate = (date: string | Date): string => {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const handleFileUpload = async () => {
        if (!token) return;

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "video/*"],
                copyToCacheDirectory: true,
                multiple: false
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return; // User canceled or no file picked
            }

            const file = result.assets[0];

            const formData = new FormData();
            formData.append("token", token);

            if (Platform.OS === "web") {
                if (!file.file) {
                    throw new Error("No file object found in document picker result on web.");
                }

                formData.append("file", file.file);
            } else {
                const fileData = {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || "application/octet-stream"
                };

                formData.append("file", fileData as any);
            }

            const response = await fetch("https://api.taskmaster.michelbijnen.nl/submission", {
                method: "POST",
                body: formData,
                headers: Platform.OS === "web" ? {} : {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            Toast.show({
                type: "success",
                text1: "Succesvol!",
                text2: "Het bestand is geüpload 🎉"
            });
            fetchChallenge(teamName!);
        } catch (error) {
            console.error("File upload failed:", error);
            Toast.show({
                type: "error",
                text1: "Upload mislukt",
                text2: "Probeer het opnieuw"
            });
        }
    };

    const logout = async () => {
        await storage.removeItem("token");
        setToken(null);
        setTeamName(null);
        setChallenge(null);
        setHasSubmitted(false);
        setLoginVisible(true);
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {teamName && (
                    <>
                        <Text style={styles.loggedInText}>Ingelogd als: <Text style={styles.teamName}>{teamName}</Text></Text>
                        <Button title="Log uit" onPress={logout} />
                    </>
                )}
            </View>
            {challenge ? (
                <View style={styles.card}>
                    <Text style={styles.title}>{challenge.title}</Text>
                    <Text style={styles.description}>{challenge.description}</Text>
                    <Text style={styles.startDate}>
                        Gestart op: {formatDate(challenge.startDate)}
                    </Text>
                    <Text style={[styles.submissionStatus, hasSubmitted ? styles.submitted : styles.notSubmitted]}>
                        {hasSubmitted ? "Jullie team heeft al een inzending gedaan ✅" : "Nog geen inzendingen voor deze task ❌"}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button title={hasSubmitted ? "Opnieuw verzenden" : "Verzend een bestand!"} onPress={handleFileUpload}/>
                    </View>
                    <Text style={styles.description}>NB: Alle inzendingen worden opgeslagen</Text>
                </View>
            ) : (
                <Text style={styles.loading}>Task wordt geladen...</Text>
            )}

            <LoginModal visible={loginVisible} onClose={() => handleIsLoggedIn()}/>
            <Toast
                position="bottom"
                visibilityTime={3000}
                autoHide={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        padding: 20
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        width: "100%",
        maxWidth: 400
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333"
    },
    description: {
        fontSize: 16,
        marginBottom: 10,
        color: "#666"
    },
    startDate: {
        fontSize: 14,
        marginBottom: 15,
        color: "#888"
    },
    submissionStatus: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10
    },
    submitted: {
        color: "green"
    },
    notSubmitted: {
        color: "red"
    },
    loading: {
        fontSize: 18,
        color: "#888"
    },
    buttonContainer: {
        marginTop: 10
    },
    header: {
        width: '100%',
        padding: 16,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
        maxWidth: 400
    },
    loggedInText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    teamName: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
});
