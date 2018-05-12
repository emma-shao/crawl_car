console.log('开始时间(ms): ' + Date.now());
const request = require('request');
const settings = require('./config.json');

const qb = require('node-querybuilder').QueryBuilder(settings.mysql, 'mysql');
const table = 'car_brands';

//汽车品牌logo地址获取
const url = 'https://www.xin.com/apis/Ajax_home/get_home_brand/';
request.get(url, function(error, response, body) {
    if (response && response.statusCode == 200) {
        var json = JSON.parse(body);
        if (json.error_code == 200) { // 代表获取成功
            for(var group=0; group<json.data.length; group++) {
                for(var letter in json.data[group]) {
                    for(var i=0; i<json.data[group][letter].length; i++) {
                        var brand = json.data[group][letter][i];
                        updateOrCreate(brand);
                    }
                }
            }
        }
    } else {
        console.log('汽车数据获取失败:', error);
    }
});

// 插入地区
function updateOrCreate(row) {
    // 省市级才具有name\pinyin
    var data = {
        brand_id: row.brandid,
        brand_name: row.brandname,
        letter: row.letter,
        sort: row.orderid,
        country: row.country,
        pinyin: row.pinyin,
        en_name: row.en_name,
        enable: row.xin_enable,
        logo: row.logo
    };
    qb.select('*').where({brand_id: data.brand_id}).get(table, (err,res)=>{
        if(err) {
            console.log(data);
            throw err;
        }
        if (res.length) { // 存在进行更新
            qb.update(table, data, {brand_id: data.brand_id}, (err, res)=>{
                if(err) {
                    console.log(data);
                    throw err;
                } else {
                    console.log(data.id + '更新 时间(ms):' + Date.now());
                }
            });
        } else { // 不存在进行新增
            console.log('新增');
            qb.insert(table, data, (err, res)=>{
                if(err) {
                    console.log(data);
                    throw err;
                } else {
                    console.log(data.id + '新增 时间(ms):' + Date.now());
                }
            });
        }
    });
}