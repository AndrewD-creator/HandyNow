//(NotJustDev, 2021)

import React from 'react'
import {View, Text, TextInput, StyleSheet } from 'react-native'

const CustomInput = ({value, setValue, placeholder, secureTextEntry }) => {
    return (
        <View style={styles.container}>
            <TextInput
            value={value} 
            onChangeText={setValue}
            placeholder={placeholder}
             style={styles.input} 
             secureTextEntry={secureTextEntry}

            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,

        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 5,
        marginTop: 10,



    },
    input: {},

});

export default CustomInput

//•	NotJustDev (2021) React Native Login Authentication PART 1 (step-by-step tutorial) Available at: https://www.youtube.com/watch?v=ALnJLbjI7EY (Accessed on: 02/11/24)
