import math as mt
import time
class node:
    def __init__(self, pair, F_cost, H_cost, G_cost, previous):
        self.pair = pair
        self.F_cost = F_cost
        self.H_cost = H_cost
        self.G_cost = G_cost
        self.previous = previous

start_node = node([0,0],0,0,0,[-1,-1])
end_node = node([0,0],0,0,0,[-1,-1])

A = [[1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1]]

def minimum(lst):
    if(len(lst)) >= 1:
        minF = lst[0].F_cost
        minNode = lst[0]
    else:
        return 0

    for i in lst:
        if(i.F_cost < minF or (i.F_cost == minF and i.H_cost < minNode.H_cost)):
                minF = i.F_cost
                minNode = i
          
    return minNode


##this is the shortest path to the goal without any obstructions (heuristic cost)
def hcost(coords):
    x1 = coords[0]
    y1 = coords[1]

    x2 = end_node.pair[0]
    y2 = end_node.pair[1]  
    distance = 0
    while abs(x1 - x2) >=1 and abs(y1 - y2) >=1:
        if x1 > x2:
            x1 = x1 - 1
        else:
            x1 = x1 + 1
        if y1 > y2:
            y1 = y1 - 1
        else:
            y1 = y1 + 1
        distance = distance + 20 
    
    if(x2 == x1):
        distance = distance + abs(y1 - y2)*10
    else:
        distance = distance + abs(x1 - x2)*10
    return distance

##this is the quickest path from current node to our starting point following our previous tracks -- needs to be updated
def gcost(coords, current):
    x1 = coords[0]
    y1 = coords[1]

    x2 = current.pair[0]
    y2 = current.pair[1]

    x = mt.floor(((x2 - x1)**2 + (y2-y1)**2)**(1/2.00)*10)
        
    return x + current.G_cost

##returns all the adjacent neighbors of the current node
def generate_neighbors(coords):
    row = coords[0]
    col = coords[1]
    return [[row-1,col],[row, col+1],[row,col-1],[row+1,col]]
    #return [[row-1,col-1],[row-1,col],[row-1,col+1],[row, col+1],[row,col-1],[row+1,col-1],[row+1,col],[row+1,col+1]]

##checks to see if the current coordiantes are in the list
def contains(lst, coords):
    for i in lst:
        if (i.pair[0] == coords[0] and i.pair[1] == coords[1]):
            return True
    return False

##returns where in the list the contained coordinates are
def contained_where(lst, coords):
    iterator = 0
    for i in lst:
        if (i.pair[0] == coords[0] and i.pair[1] == coords[1]):
            return iterator
        iterator = iterator + 1
    return False

##appends the node to the list Q in a priority based on F.cost and then H.cost 
def append(node, Q):

    if len(Q) == 0:
        Q.append(node)

    ## will append to the end automatically if the last value has a less value than the new one that will be added
    ## goal here is to save time where we can
    elif Q[len(Q)-1].F_cost < node.F_cost or Q[len(Q)-1].F_cost == node.F_cost and Q[len(Q)-1].H_cost <= node.H_cost:
        Q.append(node)
        
    else:
        x = 0
        while x < len(Q): 
            if node.F_cost < Q[x].F_cost or node.F_cost == Q[x].F_cost and node.H_cost < Q[x].H_cost:
                Q.insert(x,node)
                return
            x = x + 1
        Q.append(node)

##will check the edge cases to see if they are in bounds
def dim_check(coords,A):
    return(coords[0] < len(A) and coords[0] >=0 and coords[1] < len(A[0]) and coords[1] >=0 and A[coords[0]][coords[1]] == 1)
     
def path_finding(map, start, end):
    #start and end are both [y,x] for sake of [rows,columns]
    global A
    global start_node
    global end_node
    A = map
    iterations = 0
            
  
    #starting node is at x = 40, y = 17
    #ending   node is at x = 110, y = 45
    start_node = node([17,40],0,0,0,[-1,-1])
    end_node = node([45,110],0,0,0,[-1,-1])

    ##adds start node to opened array so we can begin
    opened = [start_node]
    closed = []

    print("Calculating path from starting node (",start_node.pair[::-1],") to ending node (", end_node.pair[::-1],")")
    t0 = time.time()

    while len(opened)!= 0 :

        current = minimum(opened)
        iterations = iterations + 1
        ##prints the number of iterations and time spent on algorithm for timing analysis
        if iterations % 2500 == 0:
            print("Iterations: ",  iterations, "\t\t|\t\tCurrent time: ", time.time()-t0, " seconds")

        ##if more than 10000 iterations, odds are we failed
        if iterations >= 10000:
            print("Not found in ", iterations, " iterations")
            return []
        
        ##takes current node and puts it in the closed list, means we have accessed it
        if contains(opened, current.pair):
            opened.remove(current)
        append(current, closed)

        ##this means we have found the goal
        if(current.pair == end_node.pair):
            end_node.previous = current.previous
         
            print("Found ",current.pair[::-1], " from ", start_node.pair[::-1]," after ", iterations, " iterations and ", time.time()-t0, " seconds")

            new_node = end_node
            
            path_list = []
            while new_node.previous != [-1,-1]:
                path_list.append(new_node.pair[::-1])
                new_node = closed[contained_where(closed,new_node.previous)]
            return path_list[::-1]
       
       ##if we have not found the goal node, generate neighbors and calculate all the proper costs and add them to the set of opened nodes
       ##or update cost of node if needed
        neighbors = generate_neighbors(current.pair) 

        for i in neighbors:
            if dim_check(i,A) and not contains(closed,i):
                h = hcost(i)
                g = gcost(i, current)               
                f = g + h

                if not contains(opened, i):
                    append(node(i,f,h,g,current.pair),opened)
                
                else:
                    if opened[contained_where(opened,i)].F_cost > f or opened[contained_where(opened,i)].F_cost == f and opened[contained_where(opened,i)].H_cost > h:
                        opened[contained_where(opened,i)].F_cost = f
                        opened[contained_where(opened,i)].H_cost = h
                        opened[contained_where(opened,i)].G_cost = g
                        opened[contained_where(opened,i)].previous = current.pair
                        new_node = opened[contained_where(opened,i)]
                        opened.remove(new_node)
                        append(new_node, opened)

    print("No path found ",current.pair, " from ", start_node.pair," after ", iterations, " iterations and ", time.time()-t0, " seconds")
    return []