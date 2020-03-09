
angular.module('BlocksApp').controller('HomeController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });
    var init = 0;
    var renderBlockHeight = $('.dataStatistics').dataStatistics()
    renderBlockHeight.init();
    var URL = '/data';
    var timer = null;
    
    $rootScope.isHome = true;

    $scope.reloadBlocks = function() {
      $scope.blockLoading = true;
      $http({
        method: 'POST',
        url: baseUrl + URL,
        data: {"action": "latest_blocks"}
      }).success(function(data) {
        $scope.blockLoading = false;
        $scope.latest_blocks = data.blocks;
        //get latest data
        $scope.blockHeight = data.blockHeight;
        $scope.blockTime = data.blockTime;
        $scope.TPS = data.TPS;
        if (init !== data.blockHeight) {
          init = data.blockHeight
          $scope.meanDayRewards = data.meanDayRewards;
          console.log(init)
          renderBlockHeight.render(init)
        }
        timer = setTimeout(() => {
          $scope.reloadBlocks()
        }, 2000);
      });
      todayRewards();
      totalNodes();
    }
    
    function todayRewards(){
      $http({
        method: 'POST',
        url: baseUrl + '/todayRewards',
        data: {}
      }).success(function(data) {
        $scope.todayRewards = data;
      });
    }

    function totalNodes(){
      $http({
        method: 'POST',
        url: baseUrl + '/totalMasterNodes',
        data: {}
      }).success(function(data) {
        $scope.totalNodes = data;
      });
    }

    var temparr = [{}]
    var timer2 = null
    $scope.reloadTransactions = function() {
      $scope.txLoading = true;
      $http({
        method: 'POST',
        url: baseUrl + URL,
        data: {"action": "latest_txs"}
      }).success(function(data) {
        if (data.txs[0] && temparr[0].hash !== data.txs[0].hash) {
          var oHtml = $('#newblock').find('.todo-tasklist-item').eq(0)
          var oHtmlExtend = $('#newextend').find('.item').eq(0)
          oHtml.css('margin-bottom', '-84px')
          oHtmlExtend.css('margin-bottom', '-84px')
          $scope.latest_txs = data.txs;
          $scope.txLoading = false;
          temparr = data.txs
          setTimeout(() => {
            $('#newblock').find('.todo-tasklist-item').eq(0).css({
              'margin-bottom': '10px',
              'transition': ' all 0.3s'
            })
            $('#newextend').find('.item').eq(0).css({
              'margin-bottom': '10px',
              'transition': ' all 0.3s'
            })
          }, 1000)
        }
        timer2 = setTimeout($scope.reloadTransactions, 5000)
      });  
    }

    // 清除首页数据请求
    $scope.$on("$destroy", function() {
      $rootScope.isHome = false
      clearTimeout(timer)
      clearTimeout(timer2)
    })
    $scope.reloadBlocks();
    $scope.reloadTransactions();
    $scope.txLoading = false;
    $scope.blockLoading = false;
})
.directive('summaryStats', function($http) {
  return {
    restrict: 'E',
    templateUrl: baseUrl + '/views/summary-stats.html',
    scope: true,
    link: function(scope, elem, attrs){
      scope.stats = {};

      var etcEthURL = "/stats";
      var etcPriceURL = "https://coinmarketcap-nexuist.rhcloud.com/api/etc";
      var ethPriceURL = "https://coinmarketcap-nexuist.rhcloud.com/api/eth"
      scope.stats.ethDiff = 1;
      scope.stats.ethHashrate = 1;
      scope.stats.usdEth = 1;


      
      $http.post(etcEthURL, {"action": "etceth"})
       .then(function(res){
          scope.stats.etcHashrate = res.data.etcHashrate;
          scope.stats.ethHashrate = res.data.ethHashrate;
          scope.stats.etcEthHash = res.data.etcEthHash;
          scope.stats.ethDiff = res.data.ethDiff;
          scope.stats.etcDiff = res.data.etcDiff;
          scope.stats.etcEthDiff = res.data.etcEthDiff;
        });
      $http.get(etcPriceURL)
       .then(function(res){
          scope.stats.usdEtc = res.data.price["usd"].toFixed(2);
          scope.stats.usdEtcEth = parseInt(100*scope.stats.usdEtc/scope.stats.usdEth);
        });
      $http.get(ethPriceURL)
       .then(function(res){
          scope.stats.usdEth = res.data.price["usd"].toFixed(2);
          scope.stats.usdEtcEth = parseInt(100*scope.stats.usdEtc/scope.stats.usdEth);
          scope.stats.ethChange = parseFloat(res.data.change);
        });

      }
  }
});

