import numpy as np
import math as math

dim = 15

# get 3 arrays representing indicies along each axis
xx, yy, zz = np.ogrid[:dim, :dim, :dim]

# set you center point and radius you want
center = [0, 0, 0]
radius = math.sqrt(5)

# create 3d array with values that are the distance from the
# center squared
d2 = (xx-center[0])**2 + (yy-center[1])**2 + (zz-center[2])**2

# create a logical true/false array based on whether the values in d2
# above are less than radius squared
#
# so this is what you want - all the values within "radius" of the center
# are now set to True
mask = d2 < radius**2

# calculate distance squared and compare to radius squared to avoid having to use
# slow sqrt()

# now you want to get the indicies from the mask array where the value of the
# array is True.  numpy.nonzero does that, and gives you 3 numpy 1d arrays of
# indicies along each axis
s, t, u = np.nonzero(mask)

# finally, to get what you want, which is all those indicies in a list, zip them together:
coords = list(zip(s, t, u))

print(coords)
