import {Alert, Button, Modal, StyleSheet, Text, TextInput, View} from "react-native";
import axios from "axios";
import {storage} from "../services/storage";
import React, {useState} from "react";
import Toast from "react-native-toast-message";

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({visible, onClose}) => {
    const [teamName, setTeamName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const login = async () => {
        try {
            setLoading(true);
            const res = await axios.post('https://api.taskmaster.michelbijnen.nl/authenticate', {
                teamName,
                code,
            });
            const token = res.data.token;
            await storage.setItem('token', token);
            onClose();
            setLoading(false);
        } catch (e) {
            Toast.show({
                type: "error",
                text1: "Inloggen mislukt",
                text2: "Controleer uw gegevens"
            });
            setLoading(false);
        }
    };

    const handleKeyPress = ({nativeEvent}: { nativeEvent: any }) => {
        if (nativeEvent.key === 'Enter') {
            login()
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        Log in!
                    </Text>
                    <>
                        <TextInput
                            style={[styles.input]}
                            placeholder={"teamName"}
                            value={teamName}
                            onChangeText={setTeamName}
                            onKeyPress={handleKeyPress}
                            autoCapitalize="none"
                            keyboardType="default"
                            editable={!loading}
                        />
                        <TextInput
                            style={[styles.input]}
                            placeholder={"code"}
                            value={code}
                            onChangeText={setCode}
                            secureTextEntry
                            onKeyPress={handleKeyPress}
                            editable={!loading}
                        />
                    </>
                    <Button
                        title={"Submit"}
                        onPress={login}
                        disabled={loading}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    invalidInput: {
        borderColor: 'red',
    },
    errorText: {
        width: '100%',
        color: 'red',
        marginBottom: 10,
    },
});

export default LoginModal;