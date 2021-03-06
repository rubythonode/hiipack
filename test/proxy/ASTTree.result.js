/**
 * @file
 * @author zdying
 */
module.exports = {
    "baseRules": [
        "usercenter.example.com => $domain/test",
        "flight.qunar.com/flight_qzz => 127.0.0.1:8800/flight_qzz"
    ],
    "domains": [
        {
            "domain": "$domain",
            "commands": [
                {
                    "name": "proxy_pass",
                    "params": [
                        "http://127.0.0.1:8800/news/src/mock/"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$mock_user",
                        "user_$id"
                    ]
                },
                {
                    "name": "set_header",
                    "params": [
                        "Host",
                        "$domain"
                    ]
                },
                {
                    "name": "set_header",
                    "params": [
                        "UserID",
                        "$mock_user"
                    ]
                },
                {
                    "name": "set_header",
                    "params": [
                        "Access-Control-Allow-Origin",
                        "*"
                    ]
                }
            ],
            "location": [],
            "props": {}
        },
        {
            "domain": "api.qunar.com",
            "commands": [
                {
                    "name": "set_header",
                    "params": [
                        "Access-Control-Allow-Origin",
                        "*"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$node_server",
                        "'127.0.0.1:3008'"
                    ]
                },
                {
                    "name": "set",
                    "params": [
                        "$order",
                        "order"
                    ]
                }
            ],
            "location": [
                {
                    "location": "/$flight/$order/detail",
                    "commands": [
                        {
                            "name": "proxy_pass",
                            "params": [
                                "http://$node_server/user/?domain=$domain"
                            ]
                        },
                        {
                            "name": "set_header",
                            "params": [
                                "Set-Cookie",
                                "userID",
                                "200908204140"
                            ]
                        }
                    ],
                    "props": {}
                }
            ],
            "props": {}
        }
    ],
    "commands": [
        {
            "name": "set",
            "params": [
                "$domain",
                "api.example.com"
            ]
        },
        {
            "name": "set",
            "params": [
                "$local",
                "\"127.0.0.1:8800\""
            ]
        }
    ]
};