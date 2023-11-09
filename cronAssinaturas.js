
const cron = require('node-cron'),
      https = require('https'),
      axios = require('axios'),
      accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMGZhZDJhZjU3ZDc5NTIyZTBmM2ZmZmUyYjljMTVmMTllZGJlN2ZhYzcwNTA1NmUzZGMxMmZmMTVlZjZmNjdkNzM5YjZjYmJiN2ZlNGUxODYiLCJpYXQiOjE2OTM0MzA3NzAuODUxMzA2LCJuYmYiOjE2OTM0MzA3NzAuODUxMzE0LCJleHAiOjMzMjUwMzM5NTcwLjc1MzcyMywic3ViIjoiNiIsInNjb3BlcyI6W10sInRlbmFudCI6ImFxdWludGEiLCJlbWFpbCI6bnVsbH0.lbp1F-jei9Nn3IMbyXUqOzFcD_a6avjJhLBg6dUzyT2vrdZjLukYRgUmvzFQo7yeGEm6M-a_8vgcY-RywfVefZ7BUcNFK0srho_ZpiNSpPfPlwWN0DNuJRHg3JrIx-PE3QWmUt3RTRYvvZUPJ6s7L_q-9SGQH90JUPBYQKWpy3n1DLcgbLuc6wCXFvlLpbS11cqJVlGbNS8a0TYzUhBKaXeTGdEO5NcaFrseB46C4Yt-Q4W7mbVziHBAQdqEy9JZF2KS82K_PXQTbhMB-egQjgNnVeiG7GS8CMV1h8Cg4moaJAmEgKnQW5HRD5dhLJEnLp5oVNncFzkOlw7Ak5-jKk6u-76DfTJLUZLKN6TStz-Tqm5teNnkttZka5tYMSa9arHu-_4RQ9e2iV3ECbOh5PuAGo8gPrODL3ZJ9dc2Kt36TZf6psjwrunhnKa8BYjel9xTxvMY3Nv6cSUzgtUYr3sftPzWrh9Dk50nH5x-9JvIs1UncMu1IrkV_wgA4MUp831vc3fGQwuw0YsUoB567a4MCL5UIKBGcJ0tGjHUN7UITCwcoR--oiwqc0OPamgkhLBDff-W-_obdIog_iXM1eXhe9TQwrBtthxQiGKRzIWoCNEkb8oJT8wniZTopO6shLQfrdDpdrFPC83v0vpflOSA2plTtGRHOz7ZVunT5_4';

//cron.schedule('0 0 * * *', () => {
    // request headers
    const headers = {
    'Authorization': `Bearer ${accessToken}`,
    },
    options = {
        headers,
    };
    //const planosPais = ['17', '15', '14'];

    const planosPais = ['14'];
    //---------------------------------------------------------------
    // https.get('https://www.aquinta.com.br/api/plans/14/plans/145', options, (res) => {
    //     let dataFilho = '';

    //     res.on('data', (chunk) => {
    //         dataFilho += chunk;

    //         console.log('a');
    //     });

    //     res.on('end', () => {
    //         let dataFilho2 = JSON.parse(dataFilho);
    //         console.log( dataFilho2.data.description.split('#')[1] );
    //     });
    // }).on('error', (error) => {
    //     console.error(`Error: ${error.message}`);
    // });
    //---------------------------------------------------------------

    for(let idPlanPai = 0; planosPais.length > idPlanPai; idPlanPai++){
        
        console.log('Carregando registros de assinatura, Aguarde!');
        
        const apiUrl = 'https://aquinta.preview.betalabs.net/api/plans/' + planosPais[idPlanPai] + '/plans';

        https.get(apiUrl, options, (res) => {
            let data = '';
        
            res.on('data', (chunk) => {
                data += chunk;
            });
        
            res.on('end', () => {
                //objeto assinaturas
                const assinaturasObj = JSON.parse(data);
        
                for(let i1 = 0; assinaturasObj.data.length > i1; i1++ ){
                    console.log( JSON.stringify(assinaturasObj, null, 2) );
                    //consulta plano e verifica se está ativo e se o ciclo atual é 14 ou 28
                    const idPlanoFilho = assinaturasObj.data[i1].id;
                    
                    let urlPlanoFilho = 'https://www.aquinta.com.br/api/plans/' + planosPais[idPlanPai] + '/plans/' + idPlanoFilho;
                    
                    if(idPlanoFilho == '145'){

                        https.get(urlPlanoFilho, options, (res) => {
                            let dataFilho = '';
            
                            res.on('data', (chunk) => {
                                dataFilho += chunk;
                            });
                            
                            

                                
                            res.on('end', () => {
                                let dataFilho2 = JSON.parse(dataFilho),
                                idSubscriptionPlanoFilho = dataFilho2.data.description.split('#')[1];
                               const urlAssinaturaPlanoFilho = 'https://www.aquinta.com.br/api/subscriptions/' + idSubscriptionPlanoFilho;
                                
                                https.get(urlAssinaturaPlanoFilho, options, (res) => {
                                    let dataAssinaturaFilho = '';
                    
                                    res.on('data', (chunk) => {
                                        dataAssinaturaFilho += chunk;
                                    });
                    
                                    res.on('end', () => {
                                        const assinaturaPlanoFilhoObj = JSON.parse(dataFilho);
            
                                        if(assinaturaPlanoFilhoObj.data.auto_cyclezing_configuration.number_of_periods !== 28){
                                            //edita ciclo de 14 para 28 se já não estiver como 28
                                            console.log(idPlanoFilho);
                                            const apiUrlPlanoFilhoAutoCyclezing = 'https://www.aquinta.com.br/api/plans/' + idPlanoFilho + '/auto-cyclezing-configurations',
                                                    postDataPlanoFilho = {
                                                        "number_of_periods":"28",
                                                        "periodicity":"days",
                                                        "moment":"after current cycle end"
                                                    },
                                                    
                                                    optionsPlanoFilho = {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${accessToken}`
                                                        },
                                                    },
                                                    
                                                    reqPlanFilho = https.request(apiUrlPlanoFilhoAutoCyclezing, optionsPlanoFilho, (res) => {
                                                        let data = '';
                                                        
                                                        res.on('data', (chunk) => {
                                                            data += chunk;
                                                        });
            
                                                        const optionsPlanoFilhoProds = {
                                                            method: 'GET',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${accessToken}`
                                                            }
                                                        };
                                                        
                                                        res.on('end', () => {
                                                            const urlPlanoFilhoProdutos = 'https://www.aquinta.com.br/api/plans/'+ idPlanoFilho +'/plan-items',
                                                            reqPlanFilhoProdutos = https.request(urlPlanoFilhoProdutos, optionsPlanoFilhoProds, (res) => {
                                                                let data = '';
                                                                
                                                                res.on('data', (chunk) => {
                                                                    data += chunk;
                                                                });
                                                                
                                                                res.on('end', () => {
                                                                    const qtdAtualProds = JSON.parse(data),
                                                                        axiosConfig = {
                                                                        headers: { Authorization: `Bearer ${accessToken}` }
                                                                    };
            
                                                                    let newPriceTot = 0;
            
                                                                    const qtdNovaProds = [];
                                                                    for(let i = 0; qtdAtualProds.data.length > i; i++){
                                                                        qtdNovaProds[i] = {
                                                                            'item_id' : qtdAtualProds.data[i].item_id, 
                                                                            'quantity' : qtdAtualProds.data[i].quantity * 2, 
                                                                            'unit_price' : qtdAtualProds.data[i].unit_price 
                                                                        };
            
                                                                        newPriceTot = newPriceTot + (qtdAtualProds.data[i].quantity * 2) * qtdAtualProds.data[i].unit_price;
            
                                                                        //remove o item com quantidade antiga 
                                                                        axios.delete('https://www.aquinta.com.br/api/plans/'+ idPlanoFilho +'/plan-items/' + qtdAtualProds.data[i].id, {headers: { Authorization: `Bearer ${accessToken}` } })
                                                                        .then(response => {
                                                                            console.log('Resource deleted successfully:', response.data);
                                                                        })
                                                                        .catch(error => {
                                                                            console.error('Error deleting resource:', JSON.stringify(error) );
                                                                        });
                                                                    }
            
                                                                    for(let i = 0; qtdNovaProds.length > i; i++){
                                                                        axios.post(urlPlanoFilhoProdutos, qtdNovaProds[i], axiosConfig).then((response) => {
                                                                            console.log('Request successful:', response.data);
                                                                        }).catch((error) => {
                                                                            if (error.response && error.response.status === 422) {
                                                                                console.error('422 Unprocessable Entity:', JSON.stringify(error.response.data) );
                                                                            } else {
                                                                                console.error('Error:', error.message);
                                                                            }
                                                                        });
                                                                    }



                                                                    const urlSubscription = 'https://aquinta.preview.betalabs.net/api/subscriptions/' + idSubscriptionPlanoFilho;
            
                                                                    axios.put('https://www.aquinta.com.br/api/plans/' + planosPais[idPlanPai] + '/plans/'+ idPlanoFilho, {amount : newPriceTot}, axiosConfig).then((response) => {
                                                                        console.log('Request successful:', response.data);

                                                                        axios.put(urlSubscription, {amount : newPriceTot}, axiosConfig).then((response) => {
                                                                            console.log('Request successful:', response.data);
                                                                        }).catch((error) => {
                                                                            if (error.response && error.response.status === 422) {
                                                                                console.error('422 Unprocessable Entity:', JSON.stringify(error.response.data) );
                                                                            } else {
                                                                                console.error('Error:', error.message);
                                                                            }
                                                                        });

                                                                    }).catch((error) => {
                                                                        if (error.response && error.response.status === 422) {
                                                                            console.error('422 Unprocessable Entity:', JSON.stringify(error.response.data) );
                                                                        } else {
                                                                            console.error('Error:', error.message);
                                                                        }
                                                                    });
            
                                                                    //adiciona frte gratis se o preço for maior que 200, se não remove
                                                                    

                                                                    if(newPriceTot > 200 ){
                                                                        
                                                                        axios.put(urlSubscription, {price_group_offers : [{price_group_id : 7, active : true}]}, axiosConfig).then((response) => {
                                                                            console.log('Request successful, added free shipping:', response.data);
                                                                        }).catch((error) => {
                                                                            if (error.response && error.response.status === 422) {
                                                                                console.error('422 Unprocessable Entity:', JSON.stringify(error.response.data) );
                                                                            } else {
                                                                                console.error('Error, free shipping not added:', error.message);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        axios.delete(urlSubscription, '7', axiosConfig).then((response) => {
                                                                            console.log('Request successful:', response.data);
                                                                        }).catch((error) => {
                                                                            if (error.response && error.response.status === 422) {
                                                                                console.error('422 Unprocessable Entity:', JSON.stringify(error.response.data) );
                                                                            } else {
                                                                                console.error('Error:', error.message);
                                                                            }
                                                                        });
                                                                    }
            
                                                                });
                                                            });
            
                                                            reqPlanFilhoProdutos.on('error', (error) => {
                                                                console.error('Error:', error);
                                                            });
                                                            
                                                            // Send the get
                                                            reqPlanFilhoProdutos;
                                                                
                                                            // End the request
                                                            reqPlanFilhoProdutos.end();
                                                        });
                                                    });
                                                        
                                            reqPlanFilho.on('error', (error) => {
                                                console.error('Error:', error);
                                            });
                                                
                                            // Send the POST data
                                            reqPlanFilho.write(JSON.stringify(postDataPlanoFilho) );
                                                
                                            // End the request
                                            reqPlanFilho.end();
            
                                        }
                                    });
                                }).on('error', (error) => {
                                    console.error(`Error: ${error.message}`);
                                });
            
                            });
                        }).on('error', (error) => {
                            console.error(`Error: ${error.message}`);
                        });

                    }//endif

                }
            });
        
        }).on('error', (error) => {
            console.error('Error:', error);
            clearInterval(loadingMsg);
        });
    }

    console.log('Cron job executado!');


//});

