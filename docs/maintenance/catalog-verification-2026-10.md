# 比較商品一覧の照合記録（PCモニター・サウンドバー・Wi-Fiルーター・ワイヤレスイヤホン、2026-10-27〜28）

比較商品一覧（`src/config/productCatalog.ts`）を追加するために、商品データの brand・model・officialSpecUrl と販売リンクを照合した記録です。

- 取得方法：メーカー公式ページ・楽天の商品ページ・Amazon の商品ページを各1回取得（UA「pittari-shindan-navi link check」、0.8秒間隔、失敗しても再試行しない）。楽天の在庫は楽天市場商品検索API（`npm run rakuten:search`、在庫ありのみ）で確認。
- 自動取得を拒否するサイト（403）は回避せず、「確認できず」として扱う。
- 型番は、公式資料と、楽天・Amazon の販売バリエーション（カラー・構成）が一致する場合だけ登録する。一致しない・確認できない商品は登録しない（保留）。
- 価格は税込（送料込みの表記があるものは送料込み）。ポイント・クーポンは除外。商品データの価格（priceYen）・価格帯（priceRange）は変更していない。
- 一時非表示にした商品の再掲載条件は `docs/maintenance/temporarily-disabled-products.md` に記録している。

## PCモニター（monitor）：公開

| ID | brand | model | 公式ページ | 販売先の確認結果 |
|---|---|---|---|---|
| 101 | BenQ | 保留 | https://www.benq.com/ja-jp/monitor/home/gw2490t.html | 楽天リンク（Joshin）が404、Amazonリンクなし。価格帯1（〜30,000円）の在庫ありの新品は、取り寄せ品と販売元を確認できない店舗だけ（正規取扱店は 35,321円）。**一時非表示**（2026-10-28） |
| 102 | BenQ | GW2790QT | https://www.benq.com/ja-jp/monitor/home/gw2790qt.html | 楽天（BenQ公式店）49,045円・Amazon とも GW2790QT |
| 103 | Pixio | 保留 | https://pixiogaming.jp/products/px278wave | 楽天は複数色の選択式、Amazon はブラック（詳細欄は PX248WAVE と表記）。カラー別型番を特定できない |
| 104 | I-O DATA | LCD-GDQ271RAB | https://www.iodata.jp/product/lcd/gaming/lcd-gdq271ra/ | 楽天・Amazon とも LCD-GDQ271RAB（ブラック）。公式ページは同じ機種のブラック・ホワイトをまとめた製品ページ（一覧ページではないため、リンク文言は「メーカー公式の製品情報」） |
| 105 | BenQ | EX271Q | https://www.benq.com/ja-jp/monitor/gaming/ex271q.html | 楽天（BenQ公式店）53,405円・Amazon とも EX271Q |
| 106 | Dell | S2725QC | Dell 公式の製品ページ（S2725QC） | 楽天 49,800円・Amazon とも S2725QC |
| 107 | LG | 27U730B-B | https://www.lg.com/jp/monitors/4k-5k-monitors/27u730b-b/ | 楽天 27U730B-B 49,755円、Amazon は日本向け表記 27U730B-BAJP |
| 108 | BenQ | MA270U | https://www.benq.com/ja-jp/monitor/home/ma270u.html | 楽天（BenQ公式店）90,644円・Amazon とも MA270U |
| 109 | ASUS | 保留 | https://www.asus.com/jp/displays-desktops/monitors/proart/proart-display-pa279crv/ | 商品データは PA279CRV。楽天（コジマ）PA279CRV 74,364円・在庫あり。Amazon は後継の別型番 PA279CRV-J だったため **Amazon リンクを削除**（2026-10-28） |
| 110 | Dell | U2725QE | Dell 公式の製品ページ（U2725QE） | 楽天 102,800円（価格帯4 内）・Amazon とも U2725QE |
| 111 | I-O DATA | LCD-CWQ341SDB-FX | https://www.iodata.jp/product/lcd/wide/lcd-cwq341sdb-fx/ | 楽天 54,215円・Amazon とも一致 |
| 112 | ASUS | XG27AQDMES-J | 登録なし（ASUS公式ストア https://store.asus.com/jp/90lm0c80-b02121-rog-strix-oled-xg27aqdmes-j.html は自動取得を拒否（403）） | 商品名・Amazon（販売元 Amazon.co.jp、73,535円、在庫あり）は XG27AQDMES-J。既存の楽天リンク（Joshin）は末尾 -J のない XG27AQDMES だったため、**楽天リンクを ASUS Store 楽天市場店の XG27AQDMES-J（73,535円・送料込み・新品・在庫あり）に差し替え**、注意書きと画像を同じ出品に合わせた（2026-10-28） |
| 113 | MSI | MAG 321UP QD-OLED X24 | https://jp.msi.com/Monitor/MAG-321UP-QD-OLED-X24 | 楽天 150,580円・Amazon とも一致 |
| 114 | ASUS | PG27UCDM | https://rog.asus.com/jp/monitors/27-to-31-5-inches/rog-swift-oled-pg27ucdm/ | 楽天 190,727円・Amazon とも一致 |
| 115 | EIZO | EV2740X-BK | 登録なし（公式ページの取得が通信エラー。再試行していない） | 楽天（コジマ）・Amazon とも EV2740X-BK |

- 厳密な候補なし率（必須条件をすべて満たす商品が0件になる回答パターンの割合）：変更前 36.98%、101 非表示後 37.67%（13,824通り中 5,208）。既存方式の診断のため30%超を既知の例外とする。画面上の候補なし率は 0%。

## サウンドバー（soundbar）：公開（2026-10-28）

| ID | brand | model | 公式ページ | 販売先の確認結果・保留理由 |
|---|---|---|---|---|
| 101 | Denon | DHT-S218 | https://www.denon.com/ja-jp/product/sound-bars/dht-s218/DHTS218JP.html | 楽天 28,749円・Amazon（DHT-S218K ブラック）とも一致 |
| 102 | Yamaha | SR-B30A | https://jp.yamaha.com/audio/home-audio/products/sound-bar/sr-b30a/index.html | メーカー生産完了。楽天（Joshin）36,850円・在庫あり。Joshin は税込3,980円以上で送料無料（沖縄・離島・山間部を除く）のため送料込み 36,850円（価格帯2 内）。掲載を維持 |
| 103 | JBL | 保留 | 確認できず（JBL公式サイトが自動取得を拒否（403）） | 楽天・Amazon とも JBLSB580AIOBLKJN |
| 104 | Sonos | 保留 | https://www.sonos.com/ja-jp/shop/ray | 楽天はブラック、Amazon はホワイト |
| 105 | Yamaha | SR-B40A | https://jp.yamaha.com/audio/home-audio/products/sound-bar/sr-b40a/index.html | メーカー生産完了。既存の楽天リンク（XPRICE 39,050円）は送料込みの総額を確定できなかったため、**楽天リンクをウインクデジタルに差し替え**（JAN 4957812694339・在庫13・送料込み 37,000円・価格帯2 内）、注意書きと画像を同じ出品に合わせた（2026-10-28）。ディーライズ2号店（37,000円・送料込み・在庫あり）も条件を満たした。ディーショップワン（37,500円）は送料込みかを確認できず |
| 106 | Bose | 保留 | https://www.bose.co.jp/p/home-theater/bose-tv-speaker-2nd-gen/TVSPKR2-SOUNDBAR.html | 公式ページに型番表記なし |
| 107 | Sony | HT-B500 | https://www.sony.jp/home-theater/products/HT-B500/ | 楽天 44,548円 |
| 108 | JBL | 保留 | 確認できず（403） | 楽天（JBL公式ストア）45,100円 |
| 109 | Sonos | 保留 | https://www.sonos.com/ja-jp/shop/beam | 楽天はホワイト、Amazon は表記が不一致 |
| 110 | Sony | 保留 | https://www.sony.jp/home-theater/products/HT-B600/ | 楽天リンクが404。Amazon の購入先は第三者（Link）、楽天の在庫ありの新品も販売元を確認できない店舗だけで、信頼できる販売元を確認できないため**一時非表示**（2026-10-28） |
| 111 | Bose | 保留 | https://www.bose.co.jp/p/home-theater/bose-smart-soundbar/SSB-SOUNDBAR.html | 公式ページに型番表記なし |
| 112 | JBL | 保留 | 確認できず（403） | 楽天（JBL公式ストア）87,890円 |
| 113 | Sony | HT-A7100 | https://www.sony.jp/home-theater/products/HT-A7100/ | 楽天 110,000円・Amazon とも一致 |
| 114 | JBL | 保留 | 確認できず（403） | JBL公式ストアは「11月中～下旬入荷予定」、Amazon の在庫は第三者（TONE）、楽天の他の在庫も販売元を確認できない店舗だけのため**一時非表示**（2026-10-28） |
| 115 | JBL | 保留 | 確認できず（403） | 楽天（ケーズデンキ）JBLBAR1000M2BLKJN 158,400円。ケーズデンキは税込3,000円以上で送料無料（沖縄・離島など一部地域を除く）のため送料込み 158,400円（価格帯5 内）。Amazon の購入先は第三者（JET商店、「メーカー完了品」表記）で販売元の信頼性を確認できないため **Amazon リンクを削除**（2026-10-28） |

- 厳密な候補なし率：変更前 31.48%、110・114 非表示後 37.04%（11,664通り中 4,320）。既存方式の診断のため30%超を既知の例外とする。画面上の候補なし率は 0%、補完候補の表示率は 62.96%。
- 比較商品一覧は13商品（110・114 を一時非表示）。全11,664通りで 110・114 の推薦0件、残る13商品の順位・採点・理由の変化0件。

## Wi-Fiルーター（wifi-router）：保留

- 102 ELECOM WRC-BE36QS-B：楽天404・Amazonリンクなし・公式ページで販売終了。
- 106 TP-Link Archer BE550 Pro：楽天404・Amazonリンクなし。
- 113 ASUS RT-BE18000：楽天404、Amazon は別構成の RT-BE18000(A)/E。
- 114 TP-Link Archer BE805：楽天404・Amazonリンクなし。
- 4商品の販売先を解決するまで比較商品一覧は追加しない。

## Bluetoothスピーカー・プロジェクター：保留

- Bluetoothスピーカー：主要仕様の再生時間はメーカーごとに測定条件が異なり、同じ条件で比較できない。111 は既知の価格帯の問題（`docs/known-product-issues.json`）。
- プロジェクター：明るさの単位が ISO ルーメンと ANSI ルーメンで混在し、属性の欠けも多い。

## ワイヤレスイヤホン（wireless-earbuds）：公開（2026-10-28）

- 比較商品一覧は15商品・13社（Nothing の CMF Buds 2a は、表示用エイリアス Nothing→CMF でまとめる）。比較項目は「形状・ノイズキャンセリング」「防水・防塵（イヤホン本体）」「マルチポイント接続」の3行。値がない・確認できない機能は「確認できず」と表示する。
- 公式リンク 14件（110 JBL は公式サイトが自動取得を拒否（403）のため登録なし）。型番は 106 の WF-LS910N（ソニー公式の全カラー共通の型名、購入先はコジマの WF-LS910N (G)）だけ。ほかは購入先が複数カラーの選択式、またはカラー別の品番しか確認できないため登録しない。
- 販売リンク・価格帯の修正（2026-10-28 確認）
  - 101 CMF Buds 2a：楽天（Nothing公式店）が404で、楽天に在庫ありの出品なし。楽天リンクを削除し、Amazon（ダークグレー、販売元 Nothing・Amazon 発送、新品、6,000円・送料無料・在庫あり）を維持。無効な楽天画像はクリア（Amazon の画像は使わない）。
  - 108 Google Pixel Buds 2a：楽天ブックスのリンクは Iris（GA10127-JP）専用、23,800円（税込・送料無料）・在庫あり。Google ストアの通常価格も 23,800円。価格帯 2→3、注意書きを Iris 専用と明記。
  - 110 JBL TOUR PRO 3：JBL公式店・大手家電量販店とも 30,690円。30,000円以内は販売元を確認できない店舗だけ。価格帯 3→4、JBL公式店のリンクを維持。
- 仕様データの訂正（公式資料で確認できたものだけ）：103 片耳 4.6→5.2g、115 片耳 7.2→7g、115 イヤホン単体の再生時間（ANCオン）0→6時間。これらの属性は採点・必須条件に使っていない。
- 未解決（公開を妨げない既知の課題）
  - 101 は商品画像なし（画面では「画像準備中」の表示）。利用条件の確認できる画像が見つかるまで追加しない。
  - 110 の公式仕様URL未確認。
  - イヤホン単体の再生時間（ANCオン）が 0 のまま：101・104・109（公式の数値・条件を確認できず）。片耳の重さが 0 のまま：113。
  - ケース込みの再生時間（totalBatteryHours）は ANCオン／オフの値が混在（例：103 は公式で通常モード48時間・ANC時32時間）。属性の測定条件を決めるまで比較一覧に表示しない。
  - 14商品の型番は未登録。
- 全40,000通りで推薦が変わったのは 10,022通り（108：予算20,000円以下 3,927通り、110：予算30,000円以下 6,095通り）。必須条件違反0件、ほかの商品の採点・条件判定の変化0件。厳密な候補なし率 5.00%（変化なし）、画面上の候補なし率 0%。