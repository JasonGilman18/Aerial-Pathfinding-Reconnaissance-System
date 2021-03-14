# https://www.dimensionengineering.com/datasheets/Sabertooth2x25v2.pdf

import serial
import time

saber2x25 = serial.Serial(
    port='/dev/ttyS0',  # Replace ttyS0 with ttyAM0 for Pi1,Pi2,Pi0
    baudrate=9600
    # parity=serial.PARITY_NONE,
    # stopbits=serial.STOPBITS_ONE,
    # bytesize=serial.EIGHTBITS,
    # timeout=1
)

'''
Sabertooth controls two motors with one 8 byte 
MOTOR1 : 1 is full reverse, 64 is stop and 127 is full forward.
MOTOR2 : 128 is full reverse, 192 is stop and 255 is full forward.
Character 0 (chr 0x00) Sending this character will shut down both motors. 
'''


def m1(speed):
    ''' 

    '''
    if speed > 60 and speed < -60:
        # print('A speed of (%s) is too high',%(speed))
        print("Speed is too high")
    else:
        motor = speed + 64
        send = chr(motor)
        saber2x25.write(send)
    return


def m2(speed):
    ''' 

    '''
    if speed > 60 and speed < -60:
        # print('A speed of (%s) is too high',%(speed))
        print("Speed is too high")
    else:
        motor = speed + 192
        send = chr(motor)
        #print(send)
        saber2x25.write(send)
    return


def move(speed):
    ''' 
    Moves both the motors
    '''
    m1(speed)
    m2(speed)
    return


def turnLeft():
    '''

    '''
    m1(30)
    m2(-30)
    time.sleep(0.5)
    stop()
    return


def turnRight():
    '''

    '''
    m1(-30)
    m2(30)
    time.sleep(0.5)
    stop()
    return


def stop():
    '''

    '''
    m1(0)
    time.sleep(0.01)
    m2(0)
    time.sleep(0.01)
    return


def emergencyStop():
    '''
    (chr 0x00) is shut down both motors
    '''
    send = chr(64)
    saber2x25.write(send)

    send = chr(192)
    saber2x25.write(send)
    return

#????MAIN_PROGRAM????#
def main(lst):
    move(20)
    time.sleep(1)
    move(20)
    time.sleep(1)
    stop()
    time.sleep(3)
    turnRight()
    time.sleep(2)
    turnLeft()
    time.sleep(2)
    stop()
    #stop()
    #emergencyStop()
    time.sleep(1)
    print("Ending Movement")
    stop()

##main program that we care about

def move_rover(lst, direction):
    if(direction == "S"):
        if lst[0][0] < lst[1][0]:
            print("Starting facing South")
            turnLeft()
            time.sleep(1)
            direction = "E"
    elif(direction == "N"):
        if lst[0][0] > lst[1][0]:
            print("Starting facing North")
            turnRight()
            time.sleep(1)
            direction = "E"
    else:
        print("invalid start: ", direction)
        return
    
    
    for i in range(1,len(lst)):
                next = lst[i]
                current = lst[i-1]
                
                ##move east
                if next[0] > current[0]:
                    if(direction == "N"):
                        stop()
                        time.sleep(1)
                        turnRight()
                        time.sleep(1)
                        move(20)
                        

                    elif(direction == "S"):
                        stop()
                        time.sleep(1)
                        turnLeft()
                        time.sleep(1)
                        move(20)
                        
                    time.sleep(1)
                    direction= "E"
                    print("East")

    

                ##move west
                elif next[0] < current[0]:

                    if(direction == "N"):
                        stop()
                        time.sleep(1)
                        turnLeft()
                        time.sleep(1)
                        move(20)

                    elif(direction == "S"):
                        stop()
                        time.sleep(1)
                        turnRight()
                        time.sleep(1)
                        move(20)
                        
                    elif(direction == "E"):
                        stop()
                        time.sleep(1)
                        turnLeft()
                        time.sleep(0.5)
                        turnRight()
                        time.sleep(1)
                        move(20)
                        

                    time.sleep(1)
                    direction= "W"
                    print("West")

           

                ##move south
                elif next[1] > current[1]:

                    if(direction == "E"):
                        stop()
                        time.sleep(1)
                        turnRight()
                        time.sleep(1)
                        move(20)

                    elif(direction == "W"):
                        stop()
                        time.sleep(1)
                        turnLeft()
                        time.sleep(1)
                        move(20)

                    time.sleep(1)
                    direction= "S"
                    print("South")

 
                ##move north
                elif next[1] < current[1]:

                    if(direction == "E"):
                        stop()
                        time.sleep(1)
                        turnLeft()
                        time.sleep(1)
                        move(20)

                    elif(direction ==  "W"):
                        stop()
                        time.sleep(1)
                        turnRight()
                        time.sleep(1)
                        move(20)
                        
                    time.sleep(1)
                    print("North")
                    direction= "N"
                    



                else:
                    stop()
    stop()
##move_rover([(1,1),(0,1)],"N")