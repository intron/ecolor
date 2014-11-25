#ecolor

ecolor is a [meteor](http://meteor.com) application that visualizes bacteria data in a polar graph. It is designed to be used with its sister application, [Rainbow Reader](https://github.com/intron/rainbowreader).

ecolor makes heavy use of [d3](http://www.d3js.org), a popular data visualization library for JavaScript. 

#about the visualization

A polar chart was chosen to use the notion of a bar chart, but acknowledge that the ordering of the colors was arbitrary and there is no particular reason why one color bin would be at the beginning of the chart and one color bin at the end. Each bin's radius is proportional to the number of colonies in that bin.



#about the exhibit

Both ecolor and Rainbow Reader were developed for a prototype biotech exhibit at [The Tech Museum of Innovation](http://www.thetech.org/) in San Jose.

Participants at the exhibit transform lab bacteria with a pool of ~900 different plasmids, each containing a red, green, and blueish reporter under individual control of a randomly selected promoter-rbs from a set of 9 spanning ~2.5 orders of expression power. Each of the 900 plasmids should theoretically drive a unique expression ratio of the three reporter genes, causing each colony to appear with a unique hue, similar to the operation of an RGB LED. Which combinations will fail? Which colors won't we see? This software and the participation of visitors at the Tech Museum is designed to find that out.

More information about the biological side of this project will be available at http://2014.igem.org/Team:The_Tech_Museum after Oct 30 2014.
