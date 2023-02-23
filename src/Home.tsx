import React, { Component, useEffect } from 'react';
import { Button, View, StyleSheet, Platform, PermissionsAndroid, Permission } from 'react-native';
import ZegoUIKit from '@zegocloud/zego-uikit-rn';
import { randomBytes } from 'react-native-randombytes'
import { HomeProps } from './App';
import { AUDIENCE_DEFAULT_CONFIG, HOST_DEFAULT_CONFIG } from './Room';

const appID = 494731272
const appSign = '78b641c84b596b2487ec7fc1a2b436abfb5a88555bc89f8e607bb55d77055967'
const liveID = '666'

export default function Home(props: HomeProps) {

    const generateUUID = (): string => {
        return randomBytes(16).toString('hex');
    }
    const UUID = generateUUID()
    const userID = UUID
    const userName = UUID

    const grantPermissions = async () => {
        // Android: Dynamically obtaining device permissions
        if (Platform.OS === 'android') {
            // Check if permission granted
            let grantedAudio = PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            );
            let grantedCamera = PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.CAMERA
            );
            const ungrantedPermissions: Permission[] = [];
            try {
                const isAudioGranted = await grantedAudio;
                const isVideoGranted = await grantedCamera;
                if (!isAudioGranted) {
                    ungrantedPermissions.push(
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
                    );
                }
                if (!isVideoGranted) {
                    ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
                }
            } catch (error) {
                ungrantedPermissions.push(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
            }
            // If not, request it
            await PermissionsAndroid.requestMultiple(ungrantedPermissions)
        }
    };

    useEffect(() => {
        ZegoUIKit.init(appID, appSign, { userID: userID, userName: userName }).then(() => {
            grantPermissions()
        })
    }, [])

    return (<View style={styles.container}>
        <View style={styles.buttonContainer}>
            <Button title="As Host" onPress={() => props.navigation.navigate('Room', {
                config: HOST_DEFAULT_CONFIG,
                userID: userID,
                liveID: liveID
            })} />
        </View>
        <View style={styles.buttonContainer}>
            <Button title="As Viewer" onPress={() => props.navigation.navigate('Room', {
                config: AUDIENCE_DEFAULT_CONFIG,
                userID: userID,
                liveID: liveID
            })} />
        </View>
    </View>)
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        flex: 1,
    }
});