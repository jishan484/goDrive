/**
 * Dashboard Analytics
 */

var chart = null, global_storage_status = {};
global_storage_status.totalSize = 0;

function renderStorageStatus(){
  let data = {}
  data.labels = []
  data.values = []
  data.colors = []
  getStorageStatus((result) => {
    result.totalSizeCalc = formatBytes(result.totalSize);
    let fileTypes = result.fileTypes;
    for(let i = 0; i < fileTypes.length; i++){
      data.labels.push(fileTypes[i].fileType);
      data.values.push(fileTypes[i].count);
      data.colors.push(generateRandomHexColor());
    }
    global_storage_status.totalSize = result.totalSize
    $('#totalUsedSpaceValue').html(formatBytes(global_storage_status.totalSize));

    var options = {
      series: data.values,
      labels: data.labels,
      chart: {
        height: 165,
        width: 130,
        type: 'donut'
      },
      dataLabels: {
        enabled: false
      },
      responsive: [{
        breakpoint: 200,
        options: {
          chart: {
            width: 200
          },
          legend: {
            show: false
          }
        }
      }],
      legend: {
        show: false
      },
      grid: {
        padding: {
          top: 0,
          bottom: 0,
          right: 15
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              value: {
                fontSize: '0.9rem',
                fontFamily: 'Public Sans',
                color: config.colors.headingColor,
                offsetY: -15,
                formatter: function (val) {
                  return Math.round(val / result.totalFileCount * 100) + '%';
                }
              },
              name: {
                offsetY: 20,
                fontFamily: 'Public Sans'
              },
              total: {
                show: true,
                fontSize: '0.8125rem',
                color: config.colors.axisColor,
                label: 'Total Files',
                formatter: function (w) {
                  if(w.globals.totalValue == undefined)
                    w.globals.totalValue = result.totalFileCount;
                  return w.globals.totalValue;
                }
              }
            }
          }
        }
      }
    };

    chart = new ApexCharts(document.querySelector("#orderStatisticsChart"), options);
    chart.render();
  });
}

setTimeout(renderStorageStatus, 2000);

function generateRandomHexColor(){
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

onSuccessUpload = function (file){
  let fileType = file.type;
  let fileSizes = file.size;
  let data = chart.w.globals.series;
  let labels = chart.w.globals.labels;
  let index = labels.indexOf(fileType);
  if(index != -1){
    data[index] += 1;
  }else{
    data.push(1);
    labels.push(fileType);
  }
  console.log(data, labels);
  chart.w.globals.totalValue += 1;
  global_storage_status.totalSize += fileSizes;
  $('#totalUsedSpaceValue').html(formatBytes(global_storage_status.totalSize));
  chart.updateOptions({
    labels: labels,
    series: data
  });
}