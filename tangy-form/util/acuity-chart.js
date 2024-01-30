// kudos: https://thiscouldbebetter.wordpress.com/2017/07/14/a-visual-acuity-chart-generator-in-javascript/
export function Coords(x, y) {
    this.x = x;
    this.y = y;
}

{
    Coords.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    Coords.prototype.clone = function () {
        return new Coords(this.x, this.y);
    }

    Coords.prototype.multiplyScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    Coords.prototype.right = function () {
        var temp = this.y;
        this.y = this.x;
        this.x = 0 - temp;
        return this;
    }

    Coords.prototype.subtract = function (other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

}

export function VisionChart
(
    pixelsPerInch,
    chartSizeInInches,
    topLineSizeInInches,
    numberOfLines
) {
    this.pixelsPerInch = pixelsPerInch;
    this.chartSizeInInches = chartSizeInInches;
    this.topLineSizeInInches = topLineSizeInInches;

    this.chartSizeInPixels =
        this.chartSizeInInches.clone().multiplyScalar
        (
            pixelsPerInch
        );

    this.topLineSizeInPixels =
        this.topLineSizeInInches * pixelsPerInch;

    var radiansPerTurn = Math.PI * 2;
    var degreesPerTurn = 360;
    var minutesPerDegree = 60;
    var angleSubtendedBySmallestSymbolInMinutes = 5;
    var angleSubtendedBySmallestSymbolInRadians =
        radiansPerTurn
        * angleSubtendedBySmallestSymbolInMinutes
        / (degreesPerTurn * minutesPerDegree);

    this.distanceFromEyeInInches =
        this.topLineSizeInInches
        / numberOfLines
        / Math.sin
        (
            angleSubtendedBySmallestSymbolInRadians
        );

    this.numberOfLines = numberOfLines;
}

{
    VisionChart.prototype.toCanvas = function (sequenceNumber) {
        var returnValue = document.createElement("canvas");
        returnValue.style = "border:1px solid";
        returnValue.width = this.chartSizeInPixels.x;
        returnValue.height = this.chartSizeInPixels.y;

        var graphics = returnValue.getContext("2d");

        graphics.fillStyle = "White";
        graphics.fillRect
        (
            0, 0,
            this.chartSizeInPixels.x,
            this.chartSizeInPixels.y
        );

        graphics.fillStyle = "Black";

        var inchesPerFoot = 12;
        var message =
            "This chart should be placed "
            + Math.floor(this.distanceFromEyeInInches / inchesPerFoot)
            + " feet + "
            + Math.floor(this.distanceFromEyeInInches % inchesPerFoot)
            + " inches from the eye.";

        var fontHeightInPixels = 16;
        graphics.font = fontHeightInPixels + "px sans-serif";
        graphics.fillText(message, 0, fontHeightInPixels);

        var drawPos = new Coords(0, this.topLineSizeInPixels);

        var directions =
            [
                new Coords(1, 0),
                new Coords(0, 1),
                new Coords(-1, 0),
                new Coords(0, -1),
            ];

        var symbolSizeInPixelsOfBottomLine =
            this.topLineSizeInPixels / this.numberOfLines

        // for (var i = 0; i < this.numberOfLines; i++) {
        //     var numberOfSymbolsOnLine = i + 1;
        //     var numberOfSymbolsOnLine = 2 + 1;
        var numberOfSymbolsOnLine = sequenceNumber;


            var symbolSizeInPixels =
                this.topLineSizeInPixels
                / numberOfSymbolsOnLine;

            var widthOfLineInPixels =
                symbolSizeInPixels
                * (numberOfSymbolsOnLine * 2 - 2);

            drawPos.x =
                (this.chartSizeInPixels.x - widthOfLineInPixels)
                / 2;

            // hardcode to 1 symbol per line
            // for (var s = 0; s < numberOfSymbolsOnLine; s++) {
            for (var s = 0; s < 1; s++) {
                var directionIndex = Math.floor
                (
                    Math.random() * directions.length
                );

                var direction = directions[directionIndex];

                this.drawSymbol(graphics, symbolSizeInPixels, drawPos, direction);

                drawPos.x += symbolSizeInPixels * 2;
            }

            var acuityQuotient =
                symbolSizeInPixels / symbolSizeInPixelsOfBottomLine;
            var acuityNumerator = 20;
            var acuityDenominator = Math.round(acuityQuotient * acuityNumerator);

            graphics.fillText
            (
                acuityNumerator + "/" + acuityDenominator,
                (this.chartSizeInPixels.x - this.topLineSizeInPixels) + 10,
                drawPos.y
            )

            drawPos.y +=
                Math.sqrt(symbolSizeInPixels)
                * this.topLineSizeInPixels
                / this.numberOfLines; // hack
        // }

        return returnValue;
    }

    VisionChart.prototype.drawSymbol = function (graphics, symbolSizeInPixels, drawPosOriginal, direction) {
        var rightOne = direction.clone().multiplyScalar(symbolSizeInPixels);
        var rightOneHalf = rightOne.clone().multiplyScalar(.5);
        var rightFourFifths = rightOne.clone().multiplyScalar(.8);
        var rightThreeFifths = rightOne.clone().multiplyScalar(.6);
        var downOne = rightOne.clone().right();
        var downOneHalf = downOne.clone().multiplyScalar(.5);
        var downOneFifth = downOne.clone().multiplyScalar(.2);

        var drawPos = drawPosOriginal.clone().subtract
        (
            rightOneHalf
        ).subtract
        (
            downOneHalf
        );

        graphics.beginPath();

        // draw an E-shaped symbol

        // top limb
        graphics.moveTo(drawPos.x, drawPos.y);
        drawPos.add(rightOne);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.add(downOneFifth);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.subtract(rightFourFifths);
        graphics.lineTo(drawPos.x, drawPos.y);

        // middle limb
        drawPos.add(downOneFifth);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.add(rightThreeFifths);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.add(downOneFifth);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.subtract(rightThreeFifths);
        graphics.lineTo(drawPos.x, drawPos.y);

        // bottom limb
        drawPos.add(downOneFifth);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.add(rightFourFifths);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.add(downOneFifth);
        graphics.lineTo(drawPos.x, drawPos.y);
        drawPos.subtract(rightOne);
        graphics.lineTo(drawPos.x, drawPos.y);

        graphics.closePath();
        graphics.fill();
    }
}