import { Component, OnInit } from '@angular/core';

function randomValues(count, min, max) {
  const delta = max - min;
  return Array.from({ length: count }).map(() => Math.random() * delta + min);
}

@Component({
  selector: 'app-group-analytics',
  templateUrl: './group-analytics.component.html',
  styleUrls: ['./group-analytics.component.css']
})
export class GroupAnalyticsComponent implements OnInit {

  constructor() { }

  // Bar chart

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];

  public barChartType = 'bar';

  public barChartLegend = true;

  public barChartData = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
  ];

  // Bar chart 2

  type3 = 'bar';
  data3 = {
    labels: ['2006', '2007', '2008', '2009', '2010', '2011', '2012'],
    datasets: [
      {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
      {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
    ]
  };
  options3 = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: true
  };

  // Line graph

  type = 'line';
  data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  };
  options = {
    responsive: true,
    maintainAspectRatio: true
  };

  // Box plot

  data2 = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Dataset 1",
        backgroundColor: "rgba(255,0,0,0.5)",
        borderColor: "red",
        borderWidth: 1,
        outlierColor: "#999999",
        padding: 10,
        itemRadius: 0,
        data: [
          randomValues(100, 0, 100),
          randomValues(100, 0, 20),
          randomValues(100, 20, 70),
          randomValues(100, 60, 100),
          randomValues(40, 50, 100),
          randomValues(100, 60, 120),
          randomValues(100, 80, 100)
        ]
      },
      {
        label: "Dataset 2",
        backgroundColor: "rgba(0,0,255,0.5)",
        borderColor: "blue",
        borderWidth: 1,
        outlierColor: "#999999",
        padding: 10,
        itemRadius: 0,
        data: [
          randomValues(100, 60, 100),
          randomValues(100, 0, 100),
          randomValues(100, 0, 20),
          randomValues(100, 20, 70),
          randomValues(40, 60, 120),
          randomValues(100, 20, 100),
          randomValues(100, 80, 100)
        ]
      }
    ]
  };

  options2 = {
    legend: {
      position: "top"
    }
  };

  ngOnInit(): void {
  }

}
