import React, {Component} from 'react';
import {Text, View, ScrollView, StyleSheet, Switch, Button, Modal, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Card} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import * as Animatable from 'react-native-animatable';
//import { Permissions, Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
//import * as Notifications from 'expo-notifications';
//import { Notifications } from 'expo';
import * as Notifications from 'expo-notifications'

class Reservation extends Component {

    constructor(props){
        super(props);
        this.state = {
            guest: 1,
            smoking: false,
            date: '',
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Reserve Table'
    }

    toggleModal(){
        this.setState({showModal: !this.state.showModal});
    }

    // handleReservation(){
    //     console.log(JSON.stringify(this.state));

    //     Alert.alert(
    //         'Your Reservation OK?',
    //         'Number of Guests: ' + this.state.guests + '\nSmoking? '+ this.state.smoking +'\nDate and Time:' + this.state.date,
    //         [
    //         {text: 'Cancel', onPress: () => { console.log('Cancel Pressed'); this.resetForm();}, style: 'cancel'},
    //         {text: 'OK', onPress: async () => {
    //             await this.presentLocalNotification(this.state.date);
    //             this.resetForm(); 
    //           }}
            
    //         // onPress: () => { 
    //         //         this.presentLocalNotification(this.state.date);
    //         //         this.resetForm(); 
    //         //     }},
    //         ],
    //         { cancelable: false }
    //     );

    //     this.toggleModal();
    // }

    handleReservation = () => {
        console.log(JSON.stringify(this.state))
        Alert.alert(
            'Your Reservation OK?',
            'Number of Guests: ' + this.state.guests + '\nSmoking? ' + ( this.state.smoking ? 'YES' : 'NO' ) + '\nDate and Time: ' + this.state.date,
            [
                {
                    text: 'Cancel',
                    onPress: () => this.resetForm(),
                    style: 'cancel' },
                {
                    text: 'OK',
                    onPress: () => {
                        this.presentLocalNotification( this.state.date )
                        this.handleReservationToCalendar( this.state.date )
                        this.resetForm()
                    }
                },
            ],
            { cancelable: false }
        );
    }

    resetForm(){
        this.setState({
            guest: 1,
            smoking: false,
            date: ''
        });
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to show notifications');
            }
        }
        //Notifications.addListener(this.presentLocalNotification());
        return permission;
    }

    obtainCalenderPermission = async () => {
        let permission = await Permissions.getAsync(Permissions.CALENDAR)

        if ( permission.status !== 'granted' ){
            permission = await Permissions.askAsync(Permissions.CALENDAR)
            if ( permission.status !== 'granted' ){
                Alert.alert("Permission not granted")
            }
        }
        return permission
    }

    getDefaultCalendarSource = async () => {
        const calendars = await Calendar.getCalendarsAsync()
        const defaultCalendars = calendars.filter(each => each.source.name === 'Default')
        return defaultCalendars[0].source
    }
    handleReservationToCalendar = async ( date ) => {
        await this.obtainCalenderPermission()

        const defaultCalendarSource = Platform.OS === 'ios' ?
            await getDefaultCalendarSource()
            : { isLocalAccount: true, name: 'Expo Calendar' };

        const tempDate = Date.parse(date)
        const startDate = new Date(tempDate)
        const endDate = new Date(tempDate + 2 * 60 * 60 * 1000)

        const calendarID = await Calendar.createCalendarAsync({
            title: 'Expo Calendar',
            color: 'blue',
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'internalCalendarName',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
        })

        await Calendar.createEventAsync(calendarID, {
            title: 'Con Fusion Table Reservation',
            startDate: startDate,
            endDate: endDate,
            timeZone: 'Asia/Hong_Kong',
            location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
        })
    }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission()
    .then(() => {
        Alert.alert('Obtained Notification Permission!')
    })
    .catch(error => {
            Alert.alert('Obtain Notification Permission Error!');
    });
    await Notifications.presentLocalNotificationAsync({
        title: 'Your Reservation',
        body: 'Reservation for '+ date + ' requested',
        ios: {
            sound: true
        },
        android: {
            color: '#512DA8'
        }
    })
    .then(() => {
        Alert.alert('Notification Sent!')
    })
    .catch(error => {
        Alert.alert('Notification sent Error!');
    });
      console.log('presentLocalNotification');
  }

    render(){
        return(
            <ScrollView>
                <Animatable.View animation="zoomIn" duration={1000} delay={500}>
                <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Number of Guests</Text>
                    <Picker
                        style={styles.formItem}
                        selectedValue={this.state.guest}
                        onValueChange={(itemValue, itemIndex) => this.setState({guest: itemValue})}
                        >
                        <Picker.Item label='1' value='1' />
                        <Picker.Item label='2' value='2' />
                        <Picker.Item label='3' value='3' />
                        <Picker.Item label='4' value='4' />
                        <Picker.Item label='5' value='5' />
                        <Picker.Item label='6' value='6' />
                    </Picker>
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
                    <Switch
                        style={styles.formItem}
                        value={this.state.smoking}
                        onTintColor='#512DA8'
                        onValueChange={(value) => this.setState({smoking: value})}
                        >
                        
                    </Switch>
                </View>
                <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Date and Time</Text>
                    <DatePicker 
                        style={{ flex: 2, marginRight: 20 }}
                        date={this.state.date}
                        mode='datetime'
                        placeholder='select date and time'
                        format=''
                        minDate="2017-01-01"
                        confirmBtnText='Confirm'
                        cancelBtnText='Cancel'
                        customStyles={{
                            dateIcon: {
                                position: 'absolute',
                                left: 0,
                                top: 4, 
                                marginLeft: 0
                            },
                            dateInput: {
                                marginLeft: 36
                            }
                        }}
                        onDateChange={(date) => {this.setState({date: date})}}
                        />
                </View>
                <View style={styles.formRow}>
                    <Button 
                        title='Reserve'
                        color='#512DA8'
                        onPress={() => this.handleReservation()}
                        accessibilityLabel='Learn more about this purple button'
                        />
                </View>
                </Animatable.View>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => {this.toggleModal();this.resetForm()}}
                    onRequestClose={() => {this.toggleModal();this.resetForm()}}
                    >
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Your Reservation</Text>
                        <Text style={styles.modalText}>Number of Guests: {this.state.guest}</Text>
                        <Text style={styles.modalText}>Smoking?: {this.state.smoking ? 'Yes' : 'No'}</Text>
                        <Text style={styles.modalText}>Date and Time: {this.state.date}</Text>
                        <Button
                            onPress={() => {this.toggleModal();this.resetForm()}}
                            color='#512DA8'
                            title="Close"
                            />
                    </View>
                </Modal>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal:{
        justifyContent: 'center',
        margin: 50
    },
    modalTitle:{
        fontSize:24,
        fontWeight:'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText:{
        fontSize: 18,
        margin: 10
    }
});

export default Reservation;