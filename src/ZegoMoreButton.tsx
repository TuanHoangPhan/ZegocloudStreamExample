import React from "react";
import { View, TouchableOpacity, Image } from "react-native"

export default function ZegoMoreButton(props: { onPress: any; width?: 36 | undefined; height?: 36 | undefined; }) {
    const { onPress, width = 36, height = 36 } = props;

    return (
        <TouchableOpacity style={{ width: width, height: height }}
            onPress={onPress}>
            <Image source={require('../resources/white_button_more.png')} style={{ width: "100%", height: "100%" }} />
        </TouchableOpacity>)
}