angular.module('BlocksApp').controller('AddressController', function($stateParams, $rootScope, $scope, $http, $location) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });
    var activeTab = $location.url().split('#');
    if (activeTab.length > 1)
      $scope.activeTab = activeTab[1];

    $rootScope.$state.current.data["pageSubTitle"] = $stateParams.hash;
    $scope.addrHash = $stateParams.hash;
    $scope.addr = {"balance": 0, "count": 0};
    
    //get address balance
    $http({
      method: 'POST',
      url: baseUrl + '/web3relay',
      //data: {"addr": $scope.addrHash, "options": ["balance", "count", "bytecode"]}
      data: {"addr": $scope.addrHash, "options": ["balance"]}
    }).success(function(data) {
      $scope.addrBalance = data.balance;
    });

    //transacton counts
    $http({
      method: 'POST',
      url: baseUrl + '/addrTXcounts',
      //data: {"addr": $scope.addrHash, "options": ["balance", "count", "bytecode"]}
      data: {"address": $scope.addrHash}
    }).success(function(data) {
      $scope.count = data.count;
      fetchTxs(1);
    });

    //try to get contract info
    $http({
      method: 'POST',
      url: baseUrl + '/tokenrelay',
      data: {"action": "info", "address": $scope.addrHash}
    }).success(function(tokenData) {
      //fetchInternalTxs();
      if(tokenData){
        $rootScope.$state.current.data["pageTitle"] = "Contract Address";
        if(tokenData.bytecode)
          $scope.isContract = true;
        $scope.token = tokenData;
      }
    });

    // fetch ethf balance 
    // $http({
    //   method: 'POST',
    //   url: baseUrl + '/fiat',
    //   data: {"addr": $scope.addrHash}
    // }).success(function(data) {
    //   $scope.addr.ethfiat = data.balance;
    // });

    //fetch all transactions
    var fetchTxs = function(count) {
      $("#table_txs").DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        ajax: {
          url: baseUrl + '/addr',
          type: 'POST',
          data: { "addr": $scope.addrHash, "count": count, "totalTX":$scope.count}
        },
        "lengthMenu": [
                    [10, 20, 50, 100, 150, -1],
                    [10, 20, 50, 100, 150, "All"] // change per page values here
                ],
        "pageLength": 20, 
        "order": [
            [6, "desc"]
        ],
        "language": {
          "lengthMenu": "_MENU_ transactions",
          "zeroRecords": "No transactions found",
          "infoEmpty": "No transactions found",
          "infoFiltered": "(filtered from _MAX_ total txs)"
        },
        "columnDefs": [ 
          
          { "targets": [ 5 ], "visible": false, "searchable": false },
          {"type": "date", "targets": 6},
          {"orderable": false, "targets": [0,2,3]},
          { "render": function(data, type, row) {
                        if (data != $scope.addrHash)
                          return '<a href="/addr/'+data+'">'+data+'</a>'
                        else
                          return data
                      }, "targets": [2,3]},
          { "render": function(data, type, row) {
                        return '<a href="/block/'+data+'">'+data+'</a>'
                      }, "targets": [1]},
          { "render": function(data, type, row) {
                        if(row[7]==0)
                          return '<span ng-show="false"  alt="transaction fail"><image src="img/FAIL.png"/></span>'+'<a href="/tx/'+data+'">'+data+'</a>'
                        else
                          return '<a href="/tx/'+data+'">'+data+'</a>'
                      }, "targets": [0]},
          { "render": function(data, type, row) {
            if (Number(data)) {
              return data
            } else {
              return '1 ticket'
            }
                                  }, "targets": [4]},
          { "render": function(data, type, row) {
                        return getDuration(data).toString();
                      }, "targets": [6]},
          ]
      });
    }
    

    $scope.internalPage = 0;
    $scope.internalTransaction=function(internalPage) {
      $http({
        method: 'POST',
        url: baseUrl + '/transactionRelay',
        data: {"action": "internalTX", "address": $scope.addrHash, "internalPage":internalPage, 'fromAccount':$scope.acc}
      }).success(function(repData) {
        $scope.internalDatas = repData;
      });
    }
    
   
})


.directive('contractSource', function($http) {
  return {
    restrict: 'E',
    templateUrl: '/views/contract-source.html',
    scope: false,
    link: function(scope, elem, attrs){
        //fetch contract stuff
        $http({
          method: 'POST',
          url: baseUrl + '/compile',
          data: {"addr": scope.addrHash, "action": "find"}
        }).success(function(data) {
          // console.log(data);
          scope.contract = data;
        });
      }
  }
})
